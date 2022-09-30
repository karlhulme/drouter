// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Get all the information passed to the request.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => {
        const headerValues = req.headers.getAllValues();
        const queryParamValues = req.queryParams.getAllValues();
        const urlParams = req.urlParams.getAllValues();

        assertEquals(headerValues, []);
        assertEquals(queryParamValues, []);
        assertEquals(urlParams, []);

        assertEquals(req.path, "/test");
        assertEquals(req.urlPattern, "/test");
        assertEquals(req.method, "GET");

        return {};
      },
      setup: () => {},
    }),
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  assertEquals(response.status, 200);
});
