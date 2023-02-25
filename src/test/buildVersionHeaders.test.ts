import { assertEquals } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Operations include blank build version headers.", async () => {
  Deno.env.delete("BUILD_GH_COMMIT");
  Deno.env.delete("BUILD_DATE_TIME");

  const routerHandler = createRouterHandler(
    createOperation({
      // deno-lint-ignore require-await
      handler: async () => ({
        body: {},
      }),
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.headers.get("build-gh-commit"), "<blank>");
  assertEquals(response.headers.get("build-date-time"), "<blank>");
});

Deno.test("Operations include specified build version headers from the env vars.", async () => {
  Deno.env.set("BUILD_GH_COMMIT", "1234");
  Deno.env.set("BUILD_DATE_TIME", "today");

  const routerHandler = createRouterHandler(
    createOperation({
      // deno-lint-ignore require-await
      handler: async () => ({
        body: {},
      }),
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.headers.get("build-gh-commit"), "1234");
  assertEquals(response.headers.get("build-date-time"), "today");
});
