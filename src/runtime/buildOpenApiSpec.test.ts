// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

Deno.test("Build an OpenAPI spec using all parts of the specification.", async () => {
  const openApiSpec = buildOpenApiSpec({
    title: "Test service",
    description: "The test service.",
    version: "1.0.0",
    operations: [{
      urlPattern: "/things/:id",
      name: "Get thing",
      operationId: "getThing",
      summary: "Get thing...",
      method: "GET",
      tags: ["Things"],
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
          referencedRuntimeTypes: [{
            name: "anotherNumber",
            schema: {
              type: "number",
            },
            referencedRuntimeTypes: [],
            underlyingType: "number",
            validator: () => [],
          }],
        },
      }],
      responseBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedRuntimeTypes: [],
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
      requestQueryParams: [{
        name: "from",
        summary: "The from.",
        type: {
          name: "string",
          schema: {
            type: "string",
          },
          referencedRuntimeTypes: [],
          underlyingType: "string",
          validator: () => [],
        },
      }],
      responseBodyType: {
        name: "things",
        schema: {
          type: "array",
        },
        referencedRuntimeTypes: [],
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
      requestHeaders: [{
        name: "archive",
        summary: "The archive.",
        type: {
          name: "boolean",
          schema: {
            type: "boolean",
          },
          referencedRuntimeTypes: [],
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
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedRuntimeTypes: [],
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
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedRuntimeTypes: [],
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
          referencedRuntimeTypes: [],
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
      requestBodyType: {
        name: "thing",
        schema: {
          type: "object",
        },
        referencedRuntimeTypes: [],
        underlyingType: "object",
        validator: () => [],
      },
      deprecated: true,
      responseFailureDefinitions: [{
        status: 400,
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