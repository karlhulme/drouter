// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

// Validation for parameters is unified, so only need to test one type,
// such as number.

Deno.test("Fail to process an operation with a parameter that fails validation.", async () => {
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
            referencedSchemaTypes: [],
            underlyingType: "number",
            validator: () => [{ error: "found" }],
          },
          isRequired: true,
        }];
      },
    }),
  );

  const invalidNumResponse = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "num": "-5",
      },
    }),
  );
  assertEquals(invalidNumResponse.status, 400);
  assertStringIncludes(
    await invalidNumResponse.text(),
    "REQUEST_PARAMETER_DID_NOT_VALIDATE",
  );
});
