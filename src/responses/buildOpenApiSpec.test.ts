// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

Deno.test("Build an OpenAPI spec using all parts of the specification.", async () => {
  const openApiSpec = buildOpenApiSpec({
    title: "Test service",
    description: "The test service.",
    version: "1.0.0",
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
      summary: "Get thing...",
      method: "GET",
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
      }],
      payloadMiddleware: [{
        process: async () => new Response(null),
        specify: () => ({}),
      }],
      tags: ["Things"],
      flags: [],
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
      summary: "Get things...",
      method: "GET",
      tags: ["Things"],
      flags: [],
      middleware: [{
        process: async () => new Response(null),
        specify: () => ({}),
      }],
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
      summary: "Delete things...",
      method: "DELETE",
      tags: ["Things"],
      flags: [],
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
      summary: "Put thing...",
      method: "PUT",
      tags: ["Things"],
      flags: [],
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
      summary: "Post thing...",
      method: "POST",
      tags: ["Things"],
      flags: [],
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
      summary: "Patch thing...",
      method: "PATCH",
      tags: ["Things"],
      flags: [],
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
        summary: "Bad request.",
      }],
      responseSuccessCode: 200,
      handler: async () => ({
        body: null,
      }),
    }],
  });

  assertEquals(openApiSpec.info.title, "Test service");
});
