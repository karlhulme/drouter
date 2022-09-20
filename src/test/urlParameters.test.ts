// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation without url parameters.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: { foo: "bar" },
      }),
      setup: () => {},
    }),
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  const result = await response.json();
  assertEquals(result, { foo: "bar" });
});

Deno.test("Process an operation with url parameters.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          num: req.urlParams.getRequiredNumber("num"),
          str: req.urlParams.getRequiredString("str"),
          bool: req.urlParams.getRequiredBoolean("bool"),
        },
      }),
      setup: (op) => {
        op.urlPattern = "/test/:num/:str/:bool";
        op.requestUrlParams = [{
          name: "num",
          summary: "A num",
          type: {
            name: "num",
            schema: {
              type: "number",
            },
            underlyingType: "number",
            validator: () => [],
          },
        }, {
          name: "str",
          summary: "A str",
          type: {
            name: "str",
            schema: {
              type: "str",
            },
            underlyingType: "string",
            validator: () => [],
          },
        }, {
          name: "bool",
          summary: "A bool",
          type: {
            name: "bool",
            schema: {
              type: "boolean",
            },
            underlyingType: "boolean",
            validator: () => [],
          },
        }];
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test/5/foo/TRUE"),
  );

  const result = await response.json();

  assertEquals(result, {
    num: 5,
    str: "foo",
    bool: true,
  });
});
