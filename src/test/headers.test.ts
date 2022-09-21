// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation with optional headers.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          num: req.headers.getOptionalNumber("num"),
          str: req.headers.getOptionalString("str"),
          bool: req.headers.getOptionalBoolean("bool"),
          obj: req.headers.getOptionalObject("obj"),
        },
      }),
      setup: (op) => {
        op.requestHeaders = [{
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
    new Request("http://localhost/test", {
      headers: {
        "num": "5",
        "str": "foo",
        "bool": "true",
        "obj": '{"foo": "bar"}',
      },
    }),
  );

  const result = await response.json();

  assertEquals(result, {
    num: 5,
    str: "foo",
    bool: true,
    obj: { foo: "bar" },
  });
});

Deno.test("Process an operation with required headers.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          num: req.headers.getRequiredNumber("num"),
          str: req.headers.getRequiredString("str"),
          bool: req.headers.getRequiredBoolean("bool"),
          obj: req.headers.getRequiredObject("obj"),
        },
      }),
      setup: (op) => {
        op.requestHeaders = [{
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
    new Request("http://localhost/test", {
      headers: {
        "num": "5",
        "str": "foo",
        "bool": "true",
        "obj": '{"foo": "bar"}',
      },
    }),
  );

  const result = await response.json();

  assertEquals(result, {
    num: 5,
    str: "foo",
    bool: true,
    obj: { foo: "bar" },
  });
});
