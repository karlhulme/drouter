// deno-lint-ignore-file require-await
import { assertStringIncludes } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

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
      },
      body: JSON.stringify({
        hello: "world",
      }),
    }),
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
      },
      body: JSON.stringify({
        hello: "world",
      }),
    }),
  );

  assertEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "JSON body does not pass validation",
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
      },
      body: "not_a_json_object",
    }),
  );

  assertEquals(response.status, 400);
  assertStringIncludes(
    await response.text(),
    "Unable to read JSON",
  );
});
