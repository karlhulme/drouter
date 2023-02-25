import { assertStrictEquals, assertStringIncludes } from "../../deps.ts";
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
  assertStringIncludes(
    resText,
    "vN/A",
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
  assertStringIncludes(
    resText,
    "v2000-01-01",
  );
});

Deno.test("A /favicon.ico request elicits a byte response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/favicon.ico", stdReqInit),
    stdReqInfo,
  );
  const buffer = await response.arrayBuffer();
  assertStrictEquals(buffer.byteLength, 67646);
});

Deno.test("A /health request elicits a health response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/health", stdReqInit),
    stdReqInfo,
  );
  assertStringIncludes(await response.text(), "Health");
});

Deno.test("An /openapi request elicits a openapi response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/openapi", stdReqInit),
    stdReqInfo,
  );
  assertStringIncludes(await response.text(), '"openapi": "3.');
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

Deno.test("An unknown route request elicits a 404 response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/unknown", stdReqInit),
    stdReqInfo,
  );
  assertStrictEquals(response.status, 404);
  assertStringIncludes(
    await response.text(),
    "OPERATION_NOT_FOUND",
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
    "API_VERSION_NOT_SUPPLIED",
  );
});
