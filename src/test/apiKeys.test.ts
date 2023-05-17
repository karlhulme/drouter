// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Successfully process an operation where an API key is required and supplied.", async () => {
  Deno.env.set("DROUTER_API_KEY", "1234");

  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: {},
      }),
      setup: (op) => {
        op.requiresApiKey = true;
      },
    }),
    (sc) => {
      sc.apiKeyHandler = async (_, apiKey) => apiKey === "1234";
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "x-api-key": "1234",
        "api-version": "2000-01-01",
      },
    }),
    stdReqInfo,
  );
  assertEquals(response.status, 200);
});

Deno.test("Fail to process an operation where an API key is required but an invalid value is supplied.", async () => {
  Deno.env.set("DROUTER_API_KEY", "1234");

  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: {},
      }),
      setup: (op) => {
        op.requiresApiKey = true;
      },
    }),
    (sc) => {
      sc.apiKeyHandler = async (_, apiKey) => apiKey === "1234";
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "x-api-key": "4321",
        "api-version": "2000-01-01",
      },
    }),
    stdReqInfo,
  );
  assertEquals(response.status, 401);
  assertStringIncludes(
    await response.text(),
    "/errors/common/apiKeyNotValid",
  );
});

Deno.test("Fail to process an operation where an API key is required but not supplied.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: {},
      }),
      setup: (op) => {
        op.requiresApiKey = true;
      },
    }),
    (sc) => {
      sc.apiKeyHandler = async (_, apiKey) => apiKey === "1234";
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 401);
  assertStringIncludes(
    await response.text(),
    "errors/common/apiKeyNotSupplied",
  );
});

Deno.test("Fail to process an operation where an API key is required but a handler is not supplied.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: {},
      }),
      setup: (op) => {
        op.requiresApiKey = true;
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 501);
  assertStringIncludes(
    await response.text(),
    "/errors/common/apiKeyHandlerNotImplemented",
  );
});
