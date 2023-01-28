import { assertStrictEquals, assertStringIncludes } from "../../deps.ts";
import { router, ServiceConfig } from "../index.ts";

const emptyServiceConfig: ServiceConfig = {
  title: "Test service",
  description: "The test service.",
  version: "1.0.0",
  middleware: [],
  payloadMiddleware: [],
  operations: [],
  namedTypes: [],
  optionalApiVersionHeader: true,
};

Deno.test("A root request elicits a root response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(new Request("http://localhost/"));
  assertStringIncludes(
    await response.text(),
    '<meta name="description" content="Root.">',
  );
});

Deno.test("A /health request elicits a health response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(new Request("http://localhost/health"));
  assertStringIncludes(await response.text(), "Health");
});

Deno.test("An /openapi request elicits a openapi response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(new Request("http://localhost/openapi"));
  assertStringIncludes(await response.text(), '"openapi": "3.');
});

Deno.test("A /docs request elicits a docs response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(new Request("http://localhost/docs"));
  assertStringIncludes(
    await response.text(),
    '<meta name="description" content="Service documentation.">',
  );
});

Deno.test("An unknown route request elicits a 404 response.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(new Request("http://localhost/unknown"));
  assertStrictEquals(response.status, 404);
  assertStringIncludes(
    await response.text(),
    "OPERATION_NOT_FOUND",
  );
});

Deno.test("A request without an API version elicits a 400 response.", async () => {
  const routerHandler = router({
    ...emptyServiceConfig,
    optionalApiVersionHeader: false,
  });
  const response = await routerHandler(new Request("http://localhost/unknown"));
  assertStrictEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "API_VERSION_NOT_SUPPLIED",
  );
});
