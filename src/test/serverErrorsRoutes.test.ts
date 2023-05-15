// deno-lint-ignore-file require-await
import { assertStringIncludes } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { assertEquals } from "../../deps.ts";
import { HttpError } from "../index.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Return 500 if an unknown error is raised.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        throw new Error("unexpected error has occured");
      },
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 500);
  assertStringIncludes(await response.text(), "INTERNAL_SERVER_ERROR");
});

Deno.test("Return 501 if an HTTP 501 error is raised.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        throw new HttpError(
          501,
          "NOT_WRITTEN_YET",
          "Code is not written for this route.",
        );
      },
      setup: (op) => {
        op.responseSuccessCode = 201;
      },
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 501);
  assertStringIncludes(await response.text(), "NOT_WRITTEN_YET");
});
