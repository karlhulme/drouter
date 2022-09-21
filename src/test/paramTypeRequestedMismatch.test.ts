// deno-lint-ignore-file require-await no-explicit-any
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Fail to process an operation where a non-number parameter is read as a number by the implementation.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          value: req.headers.getOptionalNumber("obj"),
        },
      }),
      setup: (op) => {
        op.requestHeaders = [{
          name: "obj",
          summary: "An obj",
          type: {
            name: "object",
            schema: {
              type: "object",
            },
            referencedSchemaTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
  );

  // Redirect the console.error function temporarily.
  const errors: any[] = [];
  const fn = console.error;
  console.error = (x) => errors.push(x);

  try {
    const internalErrorResponse = await routerHandler(
      new Request("http://localhost/test", {
        headers: {
          "obj": '{ "foo": "bar" }',
        },
      }),
    );
    assertEquals(internalErrorResponse.status, 500);
    assertStringIncludes(
      await internalErrorResponse.text(),
      "Internal server error",
    );
    assertStringIncludes(
      errors[0].toString(),
      "was not declared as a number",
    );
  } finally {
    console.error = fn;
  }
});

Deno.test("Fail to process an operation where a non-string parameter is read as a string by the implementation.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          value: req.headers.getOptionalString("obj"),
        },
      }),
      setup: (op) => {
        op.requestHeaders = [{
          name: "obj",
          summary: "An obj",
          type: {
            name: "object",
            schema: {
              type: "object",
            },
            referencedSchemaTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
  );

  // Redirect the console.error function temporarily.
  const errors: any[] = [];
  const fn = console.error;
  console.error = (x) => errors.push(x);

  try {
    const internalErrorResponse = await routerHandler(
      new Request("http://localhost/test", {
        headers: {
          "obj": '{ "foo": "bar" }',
        },
      }),
    );
    assertEquals(internalErrorResponse.status, 500);
    assertStringIncludes(
      await internalErrorResponse.text(),
      "Internal server error",
    );
    assertStringIncludes(
      errors[0].toString(),
      "was not declared as a string",
    );
  } finally {
    console.error = fn;
  }
});

Deno.test("Fail to process an operation where a non-boolean parameter is read as a boolean by the implementation.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          value: req.headers.getOptionalBoolean("obj"),
        },
      }),
      setup: (op) => {
        op.requestHeaders = [{
          name: "obj",
          summary: "An obj",
          type: {
            name: "object",
            schema: {
              type: "object",
            },
            referencedSchemaTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
  );

  // Redirect the console.error function temporarily.
  const errors: any[] = [];
  const fn = console.error;
  console.error = (x) => errors.push(x);

  try {
    const internalErrorResponse = await routerHandler(
      new Request("http://localhost/test", {
        headers: {
          "obj": '{ "foo": "bar" }',
        },
      }),
    );
    assertEquals(internalErrorResponse.status, 500);
    assertStringIncludes(
      await internalErrorResponse.text(),
      "Internal server error",
    );
    assertStringIncludes(
      errors[0].toString(),
      "was not declared as a boolean",
    );
  } finally {
    console.error = fn;
  }
});
