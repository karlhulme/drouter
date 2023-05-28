import { OpenApiSpecPathOperationSchema } from "https://raw.githubusercontent.com/karlhulme/dopenapi/v1.6.3/mod.ts";
import {
  OpenApiSpec,
  OpenApiSpecComponentsSchema,
  OpenApiSpecComponentsSecuritySchemes,
  OpenApiSpecPathOperation,
  OpenApiSpecPathOperationParameter,
  OpenApiSpecPathOperationResponse,
  OpenApiSpecPathOperationResponseHeader,
} from "../../deps.ts";
import { OperationHeader } from "../index.ts";
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
  const middleware = safeArray(config.middleware);
  const payloadMiddleware = safeArray(config.payloadMiddleware);
  const allMiddleware = middleware.concat(...payloadMiddleware);

  const usingApiKeys = Boolean(
    allMiddleware.find((m) => m.usesAuthApiKey),
  );

  const usingCookieAuth = Boolean(
    allMiddleware.find((m) => m.usesAuthCookie),
  );

  // The version should actually be passed to this function so that
  // we can build an API version based on the request.
  const latestVersion = getLatestVersion(
    config.operations.map((op) => op.apiVersion),
  );

  const securitySchemes: OpenApiSpecComponentsSecuritySchemes = {};

  if (usingApiKeys && config.authApiKeyHeaderName) {
    securitySchemes.apiKeyAuth = {
      type: "apiKey",
      in: "header",
      name: config.authApiKeyHeaderName,
    };
  }

  if (usingCookieAuth && config.authCookieName) {
    securitySchemes.cookieAuth = {
      type: "apiKey",
      in: "cookie",
      name: config.authCookieName,
    };
  }

  const spec: OpenApiSpec = {
    openapi: "3.0.3",
    info: {
      title: config.title,
      version: latestVersion,
      description: config.overviewHtml ? undefined : config.description,
      // Do not supply description if we have overviewHtml because
      // it appears underneath which looks weird.
    },
    components: {
      schemas: {},
      securitySchemes,
    },
    paths: {},
  };

  appendTypeToSpec(spec, {
    name: "rfc7807Problem",
    referencedSchemaTypes: [],
    schema: {
      type: "object",
      description: "A problem detail object as defined by IETF RFC 7807.",
      additionalProperties: true,
      properties: {
        status: {
          description: "The HTTP status code returned with the error.",
          type: "number",
        },
        type: {
          description: "The unique URI for the type of error.",
          type: "string",
        },
        title: {
          description: "A short description of the error type.",
          type: "string",
        },
        detail: {
          description:
            "A description of this specific occurrence of the error.",
          type: "string",
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
            example: p.name === "clubId" ? "club_638fa1f3cc7b532b" : undefined,
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
  const usedMiddlewareNames = safeArray(operation.middleware);
  const middlewares = safeArray(config.middleware).filter((m) =>
    usedMiddlewareNames.includes(m.name)
  );
  const payloadMiddlewares = safeArray(config.payloadMiddleware).filter((m) =>
    usedMiddlewareNames.includes(m.name)
  );
  const allMiddlewares = middlewares.concat(...payloadMiddlewares);

  const usesAuthApiKey = Boolean(allMiddlewares.find((m) => m.usesAuthApiKey));
  const usesAuthCookie = Boolean(allMiddlewares.find((m) => m.usesAuthCookie));

  const successCode = operation.responseSuccessCode
    ? operation.responseSuccessCode.toString()
    : "200";

  const failureDefinitions = safeArray(operation.responseFailureDefinitions);

  failureDefinitions.push({
    code: 400,
    type: "/err/apiVersionNotSupplied",
    summary:
      "The request did not contain an api-version header in the form YYYY-MM-DD.",
  });

  failureDefinitions.push({
    code: 500,
    type: "/err/internalServerError",
    summary: "An internal server error has occurred.",
  });

  if (operation.requestBodyType) {
    failureDefinitions.push({
      code: 400,
      type: "/err/requestBodyJsonDidNotValidate",
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
      type: "/err/requestParameterDidNotValidate",
      summary: "A request parameter did not validate.",
    });

    failureDefinitions.push({
      code: 400,
      type: "/err/requestParameterMissing",
      summary: "A required request parameter is missing.",
    });
  }

  const uniqueFailureCodes = Array.from(
    failureDefinitions.reduce((agg, cur) => {
      agg.add(cur.code);
      return agg;
    }, new Set<number>()),
  );

  const buildGhCommitResponseHeader: OpenApiSpecPathOperationResponseHeader = {
    description:
      "The SHA of the commit that defines the source code that the service was built from.",
    schema: {
      type: "string",
    },
    required: true,
  };
  const buildDateTimeResponseHeader: OpenApiSpecPathOperationResponseHeader = {
    description: "The date and time that the service was built in ISO format.",
    schema: {
      type: "string",
    },
    required: true,
  };

  const security: Record<string, unknown[]>[] = [];

  if (usesAuthApiKey) {
    security.push({
      apiKeyAuth: [],
    });
  }

  if (usesAuthCookie) {
    security.push({
      cookieAuth: [],
    });
  }

  return {
    operationId: operation.operationId,
    tags: operation.tags,
    summary: operation.name,
    description: operation.markdown,
    security,
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
          type: "string",
          example: "2021-01-01",
        } as unknown as OpenApiSpecPathOperationSchema,
        description: "The version targeted by the request.",
      },
      // Bring in the headers.
      ...(operation.requestHeaders || []).filter((h) =>
        includeHeaderInDocs(h, config)
      ).map((h) => ({
        name: h.name,
        in: "header",
        required: Boolean(h.isRequired),
        schema: {
          $ref: `#/components/schemas/${h.type.name}`,
        },
        deprecated: Boolean(h.deprecated),
        description: h.summary,
      } as OpenApiSpecPathOperationParameter)),
      // Bring in the query params.
      ...(operation.requestQueryParams || []).map((qp) => ({
        name: qp.name,
        in: "query",
        required: Boolean(qp.isRequired),
        schema: {
          $ref: `#/components/schemas/${qp.type.name}`,
        },
        deprecated: Boolean(qp.deprecated),
        description: qp.summary,
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
          "build-gh-commit": buildGhCommitResponseHeader,
          "build-date-time": buildDateTimeResponseHeader,
          // Bring in the operation response headers.
          ...(operation.responseHeaders || []).reduce((agg, cur) => {
            agg[cur.name] = {
              description: cur.summary,
              deprecated: Boolean(cur.deprecated),
              schema: {
                $ref: `#/components/schemas/${cur.type.name}`,
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
                $ref: `#/components/schemas/rfc7807Problem`,
              },
            },
          },
          headers: {
            "build-gh-commit": buildGhCommitResponseHeader,
            "build-date-time": buildDateTimeResponseHeader,
            // Bring in the operation response headers.
            ...(operation.responseHeaders || []).filter((h) => !h.successOnly)
              .reduce((agg, cur) => {
                agg[cur.name] = {
                  description: cur.summary,
                  deprecated: Boolean(cur.deprecated),
                  schema: {
                    $ref: `#/components/schemas/${cur.type.name}`,
                  },
                };

                return agg;
              }, {} as Record<string, OpenApiSpecPathOperationResponseHeader>),
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

/**
 * Returns true if the given header should be included in the documentation.
 * @param header An operation header.
 * @param config The service configuration.
 */
function includeHeaderInDocs(
  header: OperationHeader<string>,
  config: ServiceConfig,
) {
  if (header.name === config.authApiKeyHeaderName) {
    return false;
  }

  return true;
}
