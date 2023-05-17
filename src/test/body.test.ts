// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
} from "./shared.test.ts";

Deno.test("Process an operation with a valid payload.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: req.body,
      }),
      setup: (op) => {
        op.method = "POST";
        op.requestBodyType = {
          name: "example",
          schema: {
            type: "object",
          },
          underlyingType: "object",
          referencedSchemaTypes: [],
          validator: () => [],
        };
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-version": "2000-01-01",
      },
      body: JSON.stringify({
        hello: "world",
      }),
    }),
    stdReqInfo,
  );

  const result = await response.json();
  assertEquals(result, { hello: "world" });
});

Deno.test("Fail to process an operation with an invalid payload.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: req.body,
      }),
      setup: (op) => {
        op.method = "POST";
        op.requestBodyType = {
          name: "example",
          schema: {
            type: "object",
          },
          referencedSchemaTypes: [],
          underlyingType: "object",
          validator: () => [{ error: "found" }],
        };
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-version": "2000-01-01",
      },
      body: JSON.stringify({
        hello: "world",
      }),
    }),
    stdReqInfo,
  );

  assertEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "/errors/common/requestBodyJsonDidNotValidate",
  );
});

Deno.test("Fail to process an operation with a malformed payload.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: req.body,
      }),
      setup: (op) => {
        op.method = "POST";
        op.requestBodyType = {
          name: "example",
          schema: {
            type: "object",
          },
          referencedSchemaTypes: [],
          underlyingType: "object",
          validator: () => [{ error: "found" }],
        };
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-version": "2000-01-01",
      },
      body: "not_a_json_object",
    }),
    stdReqInfo,
  );

  assertEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "/errors/common/requestBodyJsonDidNotValidate",
  );
});
