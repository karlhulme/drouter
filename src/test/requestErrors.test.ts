// deno-lint-ignore-file require-await
import { assertStringIncludes } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { assertEquals } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Return an error raised from a route.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => {
        throw req.error(
          "/err/bespokeError",
          "This is the detail of the error.",
        );
      },
      setup: (op) => {
        op.urlPattern = "/path/here/:and/there";
        op.responseFailureDefinitions = [{
          code: 456,
          type: "/err/bespokeError",
          summary: "Raised for testing of errors.",
        }];
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/path/here/anything/there", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 456);
  assertStringIncludes(
    await response.text(),
    "/err/bespokeError",
  );
});
