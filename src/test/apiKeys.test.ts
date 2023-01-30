// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

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
      sc.apiKeyConfig = {
        envVarNames: ["DROUTER_API_KEY"],
      };
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "x-api-key": "1234",
      },
    }),
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
      sc.apiKeyConfig = {
        envVarNames: ["DROUTER_API_KEY"],
      };
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "x-api-key": "4321",
      },
    }),
  );
  assertEquals(response.status, 401);
  assertStringIncludes(
    await response.text(),
    "API_KEY_NOT_VALID",
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
      sc.apiKeyConfig = {
        envVarNames: ["DROUTER_API_KEY_MISSING"],
      };
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test"),
  );
  assertEquals(response.status, 401);
  assertStringIncludes(
    await response.text(),
    "API_KEY_NOT_SUPPLIED",
  );
});
