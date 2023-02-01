// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("Process an operation without url parameters, query params, headers or inbound payload.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: { foo: "bar" },
        headers: [{
          name: "out-header",
          value: 1234,
        }],
      }),
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
  );
  const result = await response.json();
  assertEquals(result, { foo: "bar" });
  assertEquals(response.headers.get("out-header"), "1234");
});
