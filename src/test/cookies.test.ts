// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation without url parameters, query params, headers, inbound payload or response body.", async () => {
  let handlerCalled = false;

  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => {
        handlerCalled = true;
        assertEquals(req.cookies.find((c) => c.name === "foo")?.value, "bar");
        assertEquals(
          req.cookies.find((c) => c.name === "hello")?.value,
          "world",
        );

        return {};
      },
      setup: () => {},
    }),
  );

  const response = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        cookie: "foo=bar; hello=world;",
      },
    }),
  );

  assertEquals(response.status, 200);
  assertEquals(handlerCalled, true);
});
