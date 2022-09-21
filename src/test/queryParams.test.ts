// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation with optional query params.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          num: req.queryParams.getOptionalNumber("num"),
          str: req.queryParams.getOptionalString("str"),
          bool: req.queryParams.getOptionalBoolean("bool"),
          obj: req.queryParams.getOptionalObject("obj"),
        },
      }),
      setup: (op) => {
        op.requestQueryParams = [{
          name: "num",
          summary: "A num",
          type: {
            name: "num",
            schema: {
              type: "number",
            },
            referencedRuntimeTypes: [],
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
            referencedRuntimeTypes: [],
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
            referencedRuntimeTypes: [],
            underlyingType: "boolean",
            validator: () => [],
          },
        }, {
          name: "obj",
          summary: "An object",
          type: {
            name: "obj",
            schema: {
              type: "object",
            },
            referencedRuntimeTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
  );

  const response = await routerHandler(
    new Request(
      "http://localhost/test?num=5&str=foo&bool=True&obj=%7B%22foo%22%3A%20%22bar%22%7D",
    ),
  );

  const result = await response.json();

  assertEquals(result, {
    num: 5,
    str: "foo",
    bool: true,
    obj: { foo: "bar" },
  });
});

Deno.test("Process an operation with required query params.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          num: req.queryParams.getRequiredNumber("num"),
          str: req.queryParams.getRequiredString("str"),
          bool: req.queryParams.getRequiredBoolean("bool"),
          obj: req.queryParams.getRequiredObject("obj"),
        },
      }),
      setup: (op) => {
        op.requestQueryParams = [{
          name: "num",
          summary: "A num",
          type: {
            name: "num",
            schema: {
              type: "number",
            },
            referencedRuntimeTypes: [],
            underlyingType: "number",
            validator: () => [],
          },
          isRequired: true,
        }, {
          name: "str",
          summary: "A str",
          type: {
            name: "str",
            schema: {
              type: "str",
            },
            referencedRuntimeTypes: [],
            underlyingType: "string",
            validator: () => [],
          },
          isRequired: true,
        }, {
          name: "bool",
          summary: "A bool",
          type: {
            name: "bool",
            schema: {
              type: "boolean",
            },
            referencedRuntimeTypes: [],
            underlyingType: "boolean",
            validator: () => [],
          },
          isRequired: true,
        }, {
          name: "obj",
          summary: "An object",
          type: {
            name: "obj",
            schema: {
              type: "object",
            },
            referencedRuntimeTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
          isRequired: true,
        }];
      },
    }),
  );

  const response = await routerHandler(
    new Request(
      "http://localhost/test?num=5&str=foo&bool=True&obj=%7B%22foo%22%3A%20%22bar%22%7D",
    ),
  );

  const result = await response.json();

  assertEquals(result, {
    num: 5,
    str: "foo",
    bool: true,
    obj: { foo: "bar" },
  });
});
