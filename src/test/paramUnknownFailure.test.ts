// deno-lint-ignore-file require-await no-explicit-any
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Fail to process an operation with where an undeclared parameter is read.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          value: req.headers.getOptionalNumber("num"),
        },
      }),
      setup: () => {},
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
      "/errors/common/internalServerError",
    );
    assertStringIncludes(
      errors.join().toString(),
      "was not declared for GET",
    );
  } finally {
    console.log = fn;
  }
});
