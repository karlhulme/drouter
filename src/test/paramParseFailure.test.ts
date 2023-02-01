// deno-lint-ignore-file require-await
import { assertEquals, assertStringIncludes } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

// Only need to test parsing of numbers and objects.  Strings are returned
// unchanged and not parsed.  Booleans are tested against known boolean values,
// otherwise false is returned.

Deno.test("Fail to process an operation with unparseable number or object parameters.", async () => {
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
            validator: () => [],
          },
        }, {
          name: "obj",
          summary: "An object",
          type: {
            name: "obj",
            schema: {
              type: "object",
            },
            referencedSchemaTypes: [],
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
  );

  const invalidNumResponse = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "num": "not_a_num",
        "api-version": "2000-01-01",
      },
    }),
  );
  assertEquals(invalidNumResponse.status, 400);
  assertStringIncludes(
    await invalidNumResponse.text(),
    "REQUEST_PARAMETER_VALUE_NOT_A_NUMBER",
  );

  const invalidObjResponse = await routerHandler(
    new Request("http://localhost/test", {
      headers: {
        "obj": "not_an_obj",
        "api-version": "2000-01-01",
      },
    }),
  );
  assertEquals(invalidObjResponse.status, 400);
  assertStringIncludes(
    await invalidObjResponse.text(),
    "UNABLE_TO_READ_REQUEST_PARAMETER_AS_JSON",
  );
});
