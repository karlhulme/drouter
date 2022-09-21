// deno-lint-ignore-file require-await no-explicit-any
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Fail to process an operation with where an optional parameter is read as required.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          value: req.headers.getRequiredNumber("num"),
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
            referencedSchemaTypes: [],
            underlyingType: "number",
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
      new Request("http://localhost/test"),
    );
    assertEquals(internalErrorResponse.status, 500);
    assertStringIncludes(
      await internalErrorResponse.text(),
      "Internal server error",
    );
    assertStringIncludes(
      errors[0].toString(),
      "not declared as required but the route tried",
    );
  } finally {
    console.error = fn;
  }
});
