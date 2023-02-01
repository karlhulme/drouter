import {
  OpenApiSpec,
  OpenApiSpecComponentsSchema,
  OpenApiSpecPathOperation,
  OpenApiSpecPathOperationParameter,
  OpenApiSpecPathOperationResponse,
  OpenApiSpecPathOperationResponseHeader,
} from "../../deps.ts";
import {
  Operation,
  OperationNamedType,
  ServiceConfig,
} from "../interfaces/index.ts";
import { getLatestVersion, safeArray } from "../utils/index.ts";
import { convertUrlPatternToOpenApiPath } from "./convertUrlPatternToOpenApiPath.ts";

/**
 * Returns an OpenAPI specification.
 * @param config The configuration of the service.
 */
export function buildOpenApiSpec(config: ServiceConfig): OpenApiSpec {
  const usingApiKeys = Boolean(
    config.operations.find((op) => op.requiresApiKey),
  );

  const ghCommit = Deno.env.get("BUILD_GH_COMMIT");
  const dateTime = Deno.env.get("BUILD_DATE_TIME");

  // The version should actually be passed to this function so that
  // we can build an API version based on the request.
  const latestVersion = getLatestVersion(
    config.operations.map((op) => op.apiVersion),
  );

  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: config.title,
      version: latestVersion,
      description: config.description +
        `\n\nBuild Github Commit: ${ghCommit}\nBuild Date/time: ${dateTime}`,
    },
    components: {
      schemas: {},
      securitySchemes: usingApiKeys
        ? {
          apiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "x-api-key",
          },
        }
        : {},
    },
    paths: {},
  };

  appendTypeToSpec(spec, {
    name: "svcString",
    referencedSchemaTypes: [],
    schema: {
      type: "string",
      description: "A string for service level headers and query parameters.",
    },
    underlyingType: "string",
    validator: () => [],
  }, config.namedTypes);

  const sortedOperations = config.operations
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const operation of sortedOperations) {
    appendOperationToSpec(config, spec, operation);
  }

  return spec;
}

/**
 * Appends the given operation to the OpenAPI specification including
 * any path information, route parameters and associated types.
 * @param spec An OpenAPI specification.
 * @param operation An operation.
 * @param config The service configuration.
 */
function appendOperationToSpec(
  config: ServiceConfig,
  spec: OpenApiSpec,
  operation: Operation,
) {
  const pathPattern = convertUrlPatternToOpenApiPath(operation.urlPattern);

  if (!spec.paths[pathPattern]) {
    spec.paths[pathPattern] = {
      parameters: [
        ...(operation.requestUrlParams || []).map((p) => ({
          name: p.name,
          in: "path",
          required: true,
          schema: {
            $ref: `#/components/schemas/${p.type.name}`,
          },
          description: p.summary,
        } as OpenApiSpecPathOperationParameter)),
      ],
    };
  }

  const path = spec.paths[pathPattern];

  if (operation.method === "DELETE") {
    path.delete = createPathOperation(config, operation);
  } else if (operation.method === "GET") {
    path.get = createPathOperation(config, operation);
  } else if (operation.method === "PATCH") {
    path.patch = createPathOperation(config, operation);
  } else if (operation.method === "POST") {
    path.post = createPathOperation(config, operation);
  } else if (operation.method === "PUT") {
    path.put = createPathOperation(config, operation);
  }

  if (operation.requestBodyType) {
    appendTypeToSpec(spec, operation.requestBodyType, config.namedTypes);
  }

  if (operation.responseBodyType) {
    appendTypeToSpec(spec, operation.responseBodyType, config.namedTypes);
  }

  if (Array.isArray(operation.requestUrlParams)) {
    for (const urlParam of operation.requestUrlParams) {
      appendTypeToSpec(spec, urlParam.type, config.namedTypes);
    }
  }

  if (Array.isArray(operation.requestQueryParams)) {
    for (const queryParams of operation.requestQueryParams) {
      appendTypeToSpec(spec, queryParams.type, config.namedTypes);
    }
  }

  if (Array.isArray(operation.requestHeaders)) {
    for (const header of operation.requestHeaders) {
      appendTypeToSpec(spec, header.type, config.namedTypes);
    }
  }

  if (Array.isArray(operation.responseHeaders)) {
    for (const header of operation.responseHeaders) {
      appendTypeToSpec(spec, header.type, config.namedTypes);
    }
  }
}

/**
 * Returns an OpenAPI path based on the given operation.
 * @param operation An operation.
 */
function createPathOperation(
  config: ServiceConfig,
  operation: Operation,
): OpenApiSpecPathOperation {
  const successCode = operation.responseSuccessCode
    ? operation.responseSuccessCode.toString()
    : "200";

  const middlewareSpecs = safeArray(config.middleware)
    .map((m) => m.specify(operation));

  const payloadMiddlewareSpecs = safeArray(config.payloadMiddleware)
    .map((m) => m.specify(operation));

  const middlewareHeaders = [
    ...middlewareSpecs.map((ms) => ms.headers || []).flat(),
    ...payloadMiddlewareSpecs.map((pms) => pms.headers || []).flat(),
  ];

  const middlewareQueryParams = [
    ...middlewareSpecs.map((ms) => ms.queryParams || []).flat(),
    ...payloadMiddlewareSpecs.map((pms) => pms.queryParams || []).flat(),
  ];

  const middlewareResponseHeaders = [
    ...middlewareSpecs.map((ms) => ms.responseHeaders || []).flat(),
    ...payloadMiddlewareSpecs.map((pms) => pms.responseHeaders || []).flat(),
  ];

  return {
    operationId: operation.operationId,
    tags: operation.tags,
    summary: operation.name,
    security: operation.requiresApiKey
      ? [{
        apiKeyAuth: [],
      }]
      : [],
    deprecated: Boolean(operation.deprecated),
    requestBody: operation.requestBodyType
      ? {
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/schemas/${operation.requestBodyType.name}`,
            },
          },
        },
      }
      : undefined,
    parameters: [
      // Add api-version header as standard.
      {
        name: "api-version",
        in: "header",
        required: true,
        schema: {
          $ref: `#/components/schemas/svcString`,
        },
        description: "The version targetted by the request.",
      },
      // Bring in the request and middleware headers.
      ...(operation.requestHeaders || []).map((p) => ({
        name: p.name,
        in: "header",
        required: Boolean(p.isRequired),
        schema: {
          $ref: `#/components/schemas/${p.type.name}`,
        },
        deprecated: Boolean(p.deprecated),
        description: p.summary,
      } as OpenApiSpecPathOperationParameter)),
      ...middlewareHeaders.map((p) => ({
        name: p.name,
        in: "header",
        required: p.isRequired,
        schema: {
          $ref: `#/components/schemas/svcString`,
        },
        deprecated: Boolean(p.deprecated),
        description: p.summary,
      } as OpenApiSpecPathOperationParameter)),
      // Bring in the request and middleware query params.
      ...(operation.requestQueryParams || []).map((p) => ({
        name: p.name,
        in: "query",
        required: Boolean(p.isRequired),
        schema: {
          $ref: `#/components/schemas/${p.type.name}`,
        },
        deprecated: Boolean(p.deprecated),
        description: p.summary,
      } as OpenApiSpecPathOperationParameter)),
      ...middlewareQueryParams.map((p) => ({
        name: p.name,
        in: "query",
        required: p.isRequired,
        schema: {
          $ref: `#/components/schemas/svcString`,
        },
        deprecated: Boolean(p.deprecated),
        description: p.summary,
      } as OpenApiSpecPathOperationParameter)),
    ],
    responses: {
      [successCode]: {
        description: "Success",
        content: operation.responseBodyType
          ? {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${operation.responseBodyType.name}`,
              },
            },
          }
          : undefined,
        headers: {
          // Standard reponse headers.
          "build-gh-commit": {
            description:
              "The SHA of the commit that defines the source code that the service was built from.",
            schema: {
              $ref: `#/components/schemas/svcString`,
            },
            required: true,
          },
          "build-date-time": {
            description: "The date and time that the service was built.",
            schema: {
              $ref: `#/components/schemas/svcString`,
            },
            required: true,
          },
          // Bring in the response headers.
          ...(operation.responseHeaders || []).reduce((agg, cur) => {
            agg[cur.name] = {
              description: cur.summary,
              required: Boolean(cur.isGuaranteed),
              deprecated: Boolean(cur.deprecated),
              schema: {
                $ref: `#/components/schemas/${cur.type.name}`,
              },
            };

            return agg;
          }, {} as Record<string, OpenApiSpecPathOperationResponseHeader>),
          // Bring in the response headers.
          ...middlewareResponseHeaders.reduce((agg, cur) => {
            agg[cur.name] = {
              description: cur.summary,
              required: Boolean(cur.isGuaranteed),
              deprecated: Boolean(cur.deprecated),
              schema: {
                $ref: `#/components/schemas/svcString`,
              },
            };

            return agg;
          }, {} as Record<string, OpenApiSpecPathOperationResponseHeader>),
        },
      },
      ...(operation.responseFailureDefinitions || []).reduce((agg, cur) => {
        agg[cur.code.toString()] = {
          description: cur.summary,
        };

        return agg;
      }, {} as Record<string, OpenApiSpecPathOperationResponse>),
    },
  };
}

/**
 * Appends the given type to the OpenAPI specification.
 * @param spec An OpenAPI specification.
 * @param type A type.
 * @param namedTypes An array of named types.
 */
function appendTypeToSpec(
  spec: OpenApiSpec,
  type: OperationNamedType,
  namedTypes: OperationNamedType[],
) {
  if (spec.components.schemas[type.name]) {
    // Type has already been added to the spec.
    return;
  }

  spec.components.schemas[type.name] = type
    .schema as OpenApiSpecComponentsSchema;

  // Add any referenced types to the list of types to include.
  for (const refSchemaTypeName of type.referencedSchemaTypes) {
    const refSchemaType = namedTypes.find((t) => t.name === refSchemaTypeName);

    if (refSchemaType) {
      appendTypeToSpec(spec, refSchemaType, namedTypes);
    }
  }
}
