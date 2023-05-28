// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { ServiceConfig, SpecConfig } from "../interfaces/index.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

function createServiceConfig(): ServiceConfig {
  return {
    title: "Test service",
    description: "The test service.",
    middleware: [{
      name: "mw1",
      handler: async () => ({}),
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
    }],
    payloadMiddleware: [{
      name: "mw2",
      handler: async () => ({}),
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
      }, {
        name: "x-api-key",
        summary:
          "The api key that will be filtered out if an api-key header is declared on the service config.",
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
      middleware: ["mw1", "mw2"],
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
        type: "badRequest",
        summary: "Bad request.",
      }],
      responseSuccessCode: 200,
      handler: async () => ({
        body: null,
      }),
    }],
  };
}

function createSpecConfig(): SpecConfig {
  return {
    apiVersion: "2021-01-01",
  };
}

Deno.test("Build an OpenAPI spec using all parts of the specification.", async () => {
  const openApiSpec = buildOpenApiSpec(
    createServiceConfig(),
    createSpecConfig(),
  );

  assertEquals(openApiSpec.info.title, "Test service");
  assertEquals(typeof openApiSpec.components.schemas.rfc7807Problem, "object");
});

Deno.test("Build an OpenAPI spec that uses html (instead of a description).", async () => {
  const svcConfig = createServiceConfig();
  svcConfig.overviewHtml = "This is an overview.";
  svcConfig.authHtml = "This is auth information";
  const specConfig = createSpecConfig();

  const openApiSpec = buildOpenApiSpec(svcConfig, specConfig);

  assertEquals(
    typeof openApiSpec,
    "object",
  );
});

Deno.test("Build an OpenAPI spec that uses an API key.", async () => {
  const svcConfig = createServiceConfig();
  svcConfig.authApiKeyHeaderName = "x-api-key";
  svcConfig.middleware![0].usesAuthApiKey = true;
  const specConfig = createSpecConfig();

  const openApiSpec = buildOpenApiSpec(svcConfig, specConfig);

  assertEquals(
    typeof openApiSpec.components.securitySchemes.apiKeyAuth,
    "object",
  );
});

Deno.test("Build an OpenAPI spec that uses cookie authentication.", async () => {
  const svcConfig = createServiceConfig();
  svcConfig.authCookieName = "test-cookie";
  svcConfig.middleware![0].usesAuthCookie = true;
  const specConfig = createSpecConfig();

  const openApiSpec = buildOpenApiSpec(svcConfig, specConfig);

  assertEquals(
    typeof openApiSpec.components.securitySchemes.cookieAuth,
    "object",
  );
});
