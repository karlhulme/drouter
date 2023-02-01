// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { router } from "../runtime/index.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Process an operation without url parameters, query params, headers, inbound payload or response body.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({}),
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
  );
  assertEquals(response.status, 200);
});

Deno.test("Process an operation with a custom success code.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: { foo: "bar" },
      }),
      setup: (op) => {
        op.responseSuccessCode = 201;
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
  );
  const result = await response.json();
  assertEquals(response.status, 201);
  assertEquals(result, { foo: "bar" });
});

Deno.test("Process an operation where the implementation uses an optional parameter that was not supplied.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: { value: req.queryParams.getOptionalString("str") },
      }),
      setup: (op) => {
        op.requestQueryParams = [{
          name: "str",
          summary: "A string parameter.",
          type: {
            name: "string",
            schema: {
              type: "string",
            },
            referencedSchemaTypes: [],
            underlyingType: "string",
            validator: () => [],
          },
        }];
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
  );
  const result = await response.json();
  assertEquals(result, { value: null });
});

Deno.test("Process an operation by selecting the correct one based on method.", async () => {
  const routerHandler = router({
    title: "Test service",
    description: "The test service.",
    namedTypes: [],
    middleware: [],
    payloadMiddleware: [],
    operations: [
      createOperation({
        handler: async () => ({
          body: { foo: "get" },
        }),
        setup: () => {},
      }),
      createOperation({
        handler: async () => ({
          body: { foo: "post" },
        }),
        setup: (op) => {
          op.method = "POST";
        },
      }),
    ],
  });

  const response = await routerHandler(
    new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "api-version": "2000-01-01",
      },
    }),
  );
  const result = await response.json();
  assertEquals(result, { foo: "post" });
});
