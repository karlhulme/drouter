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
import { safeArray } from "../utils/safeArray.ts";
import { convertUrlPatternToOpenApiPath } from "./convertUrlPatternToOpenApiPath.ts";

/**
 * Returns an OpenAPI specification.
 * @param config The configuration of the service.
 */
export function buildOpenApiSpec(config: ServiceConfig): OpenApiSpec {
  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: config.title,
      version: config.version,
      description: config.description,
    },
    components: {
      schemas: {},
      securitySchemes: {},
    },
    paths: {},
  };

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
    security: [],
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
          type: "string",
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
          type: "string",
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
          // Bring in the response and middleware headers.
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
          ...middlewareResponseHeaders.reduce((agg, cur) => {
            agg[cur.name] = {
              description: cur.summary,
              required: Boolean(cur.isGuaranteed),
              deprecated: Boolean(cur.deprecated),
              schema: {
                type: "string",
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
