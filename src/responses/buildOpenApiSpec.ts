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
        `\n\nBuild Github Commit: ${ghCommit}\n\nBuild Date/time: ${dateTime}`,
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

  appendTypeToSpec(spec, {
    name: "svcNumber",
    referencedSchemaTypes: [],
    schema: {
      type: "number",
      description: "A number for service level headers and query parameters.",
    },
    underlyingType: "number",
    validator: () => [],
  }, config.namedTypes);

  appendTypeToSpec(spec, {
    name: "svcProblem",
    referencedSchemaTypes: [],
    schema: {
      type: "object",
      description: "An IETF 7807 problem.",
      additionalProperties: true,
      properties: {
        status: {
          description: "The HTTP status code returned with the error.",
          schema: {
            $ref: `#/components/schemas/svcNumber`,
          },
        },
        type: {
          description: "The unique URI for the type of error.",
          schema: {
            $ref: `#/components/schemas/svcString`,
          },
        },
        title: {
          description: "A short description of the error type.",
          schema: {
            $ref: `#/components/schemas/svcString`,
          },
        },
        detail: {
          description:
            "A description of this specific occurrence of the error.",
          schema: {
            $ref: `#/components/schemas/svcString`,
          },
        },
      },
      required: [
        "status",
        "type",
        "title",
      ],
    },
    underlyingType: "object",
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

  const failureDefinitions = (operation.responseFailureDefinitions || [])
    .map((rfd) => ({
      code: rfd.code,
      summary: rfd.summary,
      type: "/errors" +
        operation.urlPattern.replaceAll(/:[^/]+/g, "-") +
        "/" +
        operation.method.toLowerCase() + "/" +
        rfd.localType,
    }));

  failureDefinitions.push({
    code: 400,
    type: "/errors/common/apiVersionNotSupplied",
    summary:
      "The request did not contain an api-version header in the form YYYY-MM-DD.",
  });

  if (operation.requestBodyType) {
    failureDefinitions.push({
      code: 400,
      type: "/errors/common/requestBodyJsonDidNotValidate",
      summary: "The request body JSON failed validation.",
    });
  }

  if (
    (operation.requestQueryParams || []).length > 0 ||
    (operation.requestHeaders || []).length > 0 ||
    (operation.requestUrlParams || []).length > 0
  ) {
    failureDefinitions.push({
      code: 400,
      type: "/errors/common/requestParameterDidNotValidate",
      summary: "A request parameter did not validate.",
    });

    failureDefinitions.push({
      code: 400,
      type: "/errors/common/requestParameterMissing",
      summary: "A required request parameter is missing.",
    });
  }

  if (operation.requiresApiKey) {
    failureDefinitions.push({
      code: 401,
      type: "/errors/common/apiKeyNotSupplied",
      summary: "An x-api-key header was not included in the request.",
    });

    failureDefinitions.push({
      code: 401,
      type: "/errors/common/apiKeyNotValid",
      summary:
        "An x-api-key header was included in the request but that value was not valid.",
    });
  }

  failureDefinitions.push(...[
    ...middlewareSpecs.map((ms) => ms.failureDefinitions || []).flat(),
    ...payloadMiddlewareSpecs.map((ms) => ms.failureDefinitions || []).flat(),
  ]);

  const uniqueFailureCodes = Array.from(
    failureDefinitions.reduce((agg, cur) => {
      agg.add(cur.code);
      return agg;
    }, new Set<number>()),
  );

  return {
    operationId: operation.operationId,
    tags: operation.tags,
    summary: operation.name,
    description: operation.markdown,
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
      ...uniqueFailureCodes.reduce((agg, cur) => {
        let description =
          "Errors are returned in the format described by IETF 7807: Problem details for HTTP APIs.";
        description +=
          " The list below shows the possible values for type and the associated meaning.";

        failureDefinitions
          .filter((fd) => fd.code === cur)
          .forEach((fd) => {
            description += `\n\n- **${fd.type}**`;
            description += `\n  ${fd.summary}`;
          });

        description +=
          "\n\nThe content-type for error responses will be `application/problem+json`.";

        agg[cur.toString()] = {
          description,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/svcProblem`,
              },
            },
          },
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
