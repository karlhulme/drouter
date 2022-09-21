// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Fail to process an operation that is not given a required parameter.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => ({
        body: {},
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
            referencedRuntimeTypes: [],
            underlyingType: "number",
            validator: () => [{ error: "found" }],
          },
          isRequired: true,
        }];
      },
    }),
  );

  const missingNumResponse = await routerHandler(
    new Request("http://localhost/test"),
  );
  assertEquals(missingNumResponse.status, 400);
  assertStringIncludes(
    await missingNumResponse.text(),
    "required and must be supplied",
  );
});