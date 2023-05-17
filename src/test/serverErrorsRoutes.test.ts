// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
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
  assertStringIncludes(
    await response.text(),
    "/errors/common/internalServerError",
  );
});

Deno.test("Return 501 if no handler defined.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: undefined,
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 501);
  assertStringIncludes(
    await response.text(),
    "/errors/common/operationNotImplemented",
  );
});

Deno.test("Return given code for bespoke HTTP error.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        throw new HttpError(
          456,
          // Include the extra trailing slash here to test
          // the path normalisation code.
          "/errors/testing/myBespokeError",
          "Code is not written for this route.",
        );
      },
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 456);
  assertStringIncludes(
    await response.text(),
    "/errors/testing/myBespokeError",
  );
});
