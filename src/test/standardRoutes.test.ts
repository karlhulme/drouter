import {
  assert,
  assertStrictEquals,
  assertStringIncludes,
} from "../../deps.ts";
import { router, ServiceConfig } from "../index.ts";
import { stdReqInfo, stdReqInit } from "./shared.test.ts";

const emptyServiceConfig: ServiceConfig = {
  title: "Test service",
  description: "The test service.",
  middleware: [],
  payloadMiddleware: [],
  operations: [],
  namedTypes: [],
};

Deno.test("A root request elicits a root response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/", stdReqInit),
    stdReqInfo,
  );
  const resText = await response.text();
  assertStringIncludes(
    resText,
    '<meta name="description" content="Root.">',
  );
});

Deno.test("A root request with defined operations elicits a root response.", async () => {
  const routerHandler = router({
    ...emptyServiceConfig,
    operations: [{
      urlPattern: "/test",
      name: "test",
      method: "GET",
      operationId: "getValue",
      tags: [],
      apiVersion: "2000-01-01",
      flags: [],
      // deno-lint-ignore require-await
      handler: async () => ({}),
    }],
  });
  const response = await routerHandler(
    new Request("http://localhost/", stdReqInit),
    stdReqInfo,
  );
  const resText = await response.text();
  assertStringIncludes(
    resText,
    '<meta name="description" content="Root.">',
  );
});

Deno.test("A /favicon.ico request elicits a byte response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/favicon.ico", stdReqInit),
    stdReqInfo,
  );
  const buffer = await response.arrayBuffer();
  assert(buffer.byteLength > 4000);
});

Deno.test("A /health request elicits a health response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/health", stdReqInit),
    stdReqInfo,
  );
  assertStringIncludes(await response.text(), "Health");
});

Deno.test("An /openapi request elicits an openapi response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/openapi", stdReqInit),
    stdReqInfo,
  );
  assertStringIncludes(await response.text(), '"openapi": "3.');
});

Deno.test("An /openapi request for a specific version elicits an openapi response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/openapi?api-version=2021-01-01", stdReqInit),
    stdReqInfo,
  );
  const text = await response.text();
  assertStringIncludes(text, '"openapi": "3.');
  assertStringIncludes(text, '"version": "2021-01-01"');
});

Deno.test("A /docs request elicits a docs response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/docs", stdReqInit),
    stdReqInfo,
  );
  assertStringIncludes(
    await response.text(),
    '<meta name="description" content="Service documentation.">',
  );
});

Deno.test("A /docs request for a specific version elicits a docs response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/docs?api-version=2021-01-01", stdReqInit),
    stdReqInfo,
  );

  const text = await response.text();
  assertStringIncludes(
    text,
    '<meta name="description" content="Service documentation.">',
  );
  assertStringIncludes(
    text,
    'spec-url="/openapi?api-version=2021-01-01"',
  );
});

Deno.test("A /rapidoc-min.js request elicits a source code response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/rapidoc-min.js", stdReqInit),
    stdReqInfo,
  );
  const text = await response.text();
  assertStringIncludes(
    text,
    '"use strict"',
  );
});

Deno.test("A /rapidoc-min.js.map request elicits a source map response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/rapidoc-min.js.map", stdReqInit),
    stdReqInfo,
  );
  const text = await response.text();
  assertStringIncludes(
    text,
    "rapidoc-min.js",
  );
  assertStringIncludes(
    text,
    "mappings",
  );
});

Deno.test("An unknown route request elicits a 404 response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/unknown", stdReqInit),
    stdReqInfo,
  );
  assertStrictEquals(response.status, 404);
  assertStringIncludes(
    await response.text(),
    "/err/operationNotFound",
  );
});

Deno.test("A request without an API version elicits a 400 response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/unknown"),
    stdReqInfo,
  );
  assertStrictEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "/err/apiVersionNotSupplied",
  );
});
