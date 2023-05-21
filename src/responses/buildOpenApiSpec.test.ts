// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { ServiceConfig } from "../interfaces/index.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

function createServiceConfig(): ServiceConfig {
  return {
    title: "Test service",
    description: "The test service.",
    middleware: [{
      process: async () => new Response(null),
      specify: () => ({
        headers: [{
          name: "middlewareHeader",
          summary: "A middleware header.",
        }],
        queryParams: [{
          name: "middlewareQueryParam",
          summary: "A middleware query param.",
        }],
        responseHeaders: [{
          name: "middlewareOutboundHeader",
          summary: "A middleware outbound header.",
        }],
      }),
    }, {
      process: async () => new Response(null),
      specify: () => ({}),
    }],
    payloadMiddleware: [{
      process: async () => new Response(null),
      specify: () => ({
        headers: [{
          name: "middlewareHeader",
          summary: "A middleware header.",
        }],
        queryParams: [{
          name: "middlewareQueryParam",
          summary: "A middleware query param.",
        }],
        responseHeaders: [{
          name: "middlewareOutboundHeader",
          summary: "A middleware outbound header.",
        }],
      }),
    }, {
      process: async () => new Response(null),
      specify: () => ({}),
    }],
    namedTypes: [{
      name: "someNumber",
      schema: {
        type: "number",
      },
      underlyingType: "number",
      referencedSchemaTypes: [],
      validator: () => [],
    }],
    operations: [{
      urlPattern: "/things/:id",
      name: "Get thing",
      operationId: "getThing",
      markdown: "Get thing...",
      method: "GET",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestUrlParams: [{
        name: "id",
        summary: "The id.",
        type: {
          name: "id",
          schema: {
            type: "number",
          },
          underlyingType: "number",
          validator: () => [],
          referencedSchemaTypes: ["someNumber"],
        },
      }],
      responseBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedSchemaTypes: [],
        underlyingType: "object",
        validator: () => [],
      },
      handler: async () => ({
        body: null,
      }),
    }, {
      urlPattern: "/things",
      name: "Get things",
      operationId: "getThings",
      markdown: "Get things...",
      method: "GET",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestQueryParams: [{
        name: "from",
        summary: "The from.",
        type: {
          name: "string",
          schema: {
            type: "string",
          },
          referencedSchemaTypes: [],
          underlyingType: "string",
          validator: () => [],
        },
      }],
      responseBodyType: {
        name: "things",
        schema: {
          type: "array",
        },
        referencedSchemaTypes: [],
        underlyingType: "array",
        validator: () => [],
      },
      handler: async () => ({
        body: null,
      }),
    }, {
      urlPattern: "/things",
      name: "Get things",
      operationId: "deleteThings",
      markdown: "Delete things...",
      method: "DELETE",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestHeaders: [{
        name: "archive",
        summary: "The archive.",
        type: {
          name: "boolean",
          schema: {
            type: "boolean",
          },
          referencedSchemaTypes: [],
          underlyingType: "boolean",
          validator: () => [],
        },
      }],
      responseSuccessCode: 204,
      handler: async () => ({
        body: null,
      }),
    }, {
      urlPattern: "/things",
      name: "Put thing",
      operationId: "putThing",
      markdown: "Put thing...",
      method: "PUT",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedSchemaTypes: [],
        underlyingType: "object",
        validator: () => [],
      },
      responseSuccessCode: 200,
      handler: async () => ({
        body: null,
      }),
    }, {
      urlPattern: "/things",
      name: "Post thing",
      operationId: "postThing",
      markdown: "Post thing...",
      method: "POST",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedSchemaTypes: [],
        underlyingType: "object",
        validator: () => [],
      },
      responseSuccessCode: 201,
      responseHeaders: [{
        name: "new-id",
        summary: "The new-id.",
        type: {
          name: "number",
          schema: {
            type: "number",
          },
          referencedSchemaTypes: [],
          underlyingType: "number",
          validator: () => [],
        },
      }],
      handler: async () => ({
        body: null,
      }),
    }, {
      urlPattern: "/things/:id",
      name: "Patch thing",
      operationId: "patchThing",
      markdown: "Patch thing...",
      method: "PATCH",
      tags: ["Things"],
      flags: [],
      apiVersion: "2000-01-01",
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedSchemaTypes: [],
        underlyingType: "object",
        validator: () => [],
      },
      deprecated: "Not in use anymore.",
      responseFailureDefinitions: [{
        code: 400,
        localType: "badRequest",
        summary: "Bad request.",
      }],
      responseSuccessCode: 200,
      handler: async () => ({
        body: null,
      }),
    }],
  };
}

Deno.test("Build an OpenAPI spec using all parts of the specification.", async () => {
  const openApiSpec = buildOpenApiSpec(createServiceConfig());

  assertEquals(openApiSpec.info.title, "Test service");
  assertEquals(typeof openApiSpec.components.schemas.rfc7807Problem, "object");
});

Deno.test("Build an OpenAPI spec that uses an API key.", async () => {
  const sc = createServiceConfig();
  sc.apiKeyHandler = async () => true;
  sc.operations[0].requiresApiKey = true;

  const openApiSpec = buildOpenApiSpec(sc);

  assertEquals(
    typeof openApiSpec.components.securitySchemes.apiKeyAuth,
    "object",
  );
});

Deno.test("Build an OpenAPI spec that uses cookie authentication.", async () => {
  const sc = createServiceConfig();
  sc.apiKeyHandler = async () => true;
  sc.cookieAuthName = "test-cookie";
  sc.operations[0].requiresCookieAuth = true;

  const openApiSpec = buildOpenApiSpec(sc);

  assertEquals(
    typeof openApiSpec.components.securitySchemes.cookieAuth,
    "object",
  );
});
