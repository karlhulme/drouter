// deno-lint-ignore-file require-await no-explicit-any
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

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

  // Redirect the console.log function temporarily.
  const errors: any[] = [];
  const fn = console.log;
  console.log = (x) => errors.push(x);

  try {
    const internalErrorResponse = await routerHandler(
      new Request("http://localhost/test", stdReqInit),
      stdReqInfo,
    );
    assertEquals(internalErrorResponse.status, 500);
    assertStringIncludes(
      await internalErrorResponse.text(),
      "/err/internalServerError",
    );
    assertStringIncludes(
      errors.join().toString(),
      "not declared as required but the route tried",
    );
  } finally {
    console.log = fn;
  }
});
