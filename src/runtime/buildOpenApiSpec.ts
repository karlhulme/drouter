import {
  OpenApiSpec,
  OpenApiSpecComponentSchema,
  OpenApiSpecPathOperation,
  OpenApiSpecPathOperationParameter,
  OpenApiSpecPathOperationResponseHeader,
} from "../../deps.ts";
import {
  GenericOperation,
  OperationNamedType,
  RouterConfig,
} from "../interfaces/index.ts";
import { convertUrlPatternToOpenApiPath } from "./convertUrlPatternToOpenApiPath.ts";

export function buildOpenApiSpec(config: RouterConfig): OpenApiSpec {
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
    appendOperationToSpec(spec, operation);
  }

  return spec;
}

function appendOperationToSpec(spec: OpenApiSpec, operation: GenericOperation) {
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
    path.delete = createPathOperation(operation);
  } else if (operation.method === "GET") {
    path.get = createPathOperation(operation);
  } else if (operation.method === "PATCH") {
    path.patch = createPathOperation(operation);
  } else if (operation.method === "POST") {
    path.post = createPathOperation(operation);
  } else if (operation.method === "PUT") {
    path.put = createPathOperation(operation);
  }

  if (operation.requestBodyType) {
    appendTypeToSpec(spec, operation.requestBodyType);
  }

  if (operation.responseBodyType) {
    appendTypeToSpec(spec, operation.responseBodyType);
  }

  if (Array.isArray(operation.requestUrlParams)) {
    for (const urlParam of operation.requestUrlParams) {
      appendTypeToSpec(spec, urlParam.type);
    }
  }

  if (Array.isArray(operation.requestQueryParams)) {
    for (const queryParams of operation.requestQueryParams) {
      appendTypeToSpec(spec, queryParams.type);
    }
  }

  if (Array.isArray(operation.requestHeaders)) {
    for (const header of operation.requestHeaders) {
      appendTypeToSpec(spec, header.type);
    }
  }

  if (Array.isArray(operation.responseHeaders)) {
    for (const header of operation.responseHeaders) {
      appendTypeToSpec(spec, header.type);
    }
  }
}

function createPathOperation(
  operation: GenericOperation,
): OpenApiSpecPathOperation {
  const successCode = operation.responseSuccessCode
    ? operation.responseSuccessCode.toString()
    : "200";

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
      ...(operation.requestHeaders || []).map((p) => ({
        name: p.name,
        in: "header",
        required: true,
        schema: {
          $ref: `#/components/schemas/${p.type.name}`,
        },
        deprecated: Boolean(p.deprecated),
        description: p.summary,
      } as OpenApiSpecPathOperationParameter)),
      ...(operation.requestQueryParams || []).map((p) => ({
        name: p.name,
        in: "query",
        required: true,
        schema: {
          $ref: `#/components/schemas/${p.type.name}`,
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
        headers: (operation.responseHeaders || []).reduce((agg, cur) => {
          agg[cur.name] = {
            description: cur.summary,
            required: cur.isGuaranteed,
            deprecated: Boolean(cur.deprecated),
            schema: {
              $ref: `#/components/schemas/${cur.type.name}`,
            },
          };

          return agg;
        }, {} as Record<string, OpenApiSpecPathOperationResponseHeader>),
      },
    },
  };
}

function appendTypeToSpec(spec: OpenApiSpec, type: OperationNamedType) {
  if (spec.components.schemas[type.name]) {
    // Type has already been added to the spec.
    return;
  }

  spec.components.schemas[type.name] = type
    .schema as OpenApiSpecComponentSchema;
}
