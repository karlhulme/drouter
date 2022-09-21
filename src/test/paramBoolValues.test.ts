// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation recognising the various bool options.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (req) => ({
        body: {
          bool: req.queryParams.getOptionalBoolean("bool"),
        },
      }),
      setup: (op) => {
        op.requestQueryParams = [{
          name: "bool",
          summary: "A bool",
          type: {
            name: "bool",
            schema: {
              type: "boolean",
            },
            referencedRuntimeTypes: [],
            underlyingType: "boolean",
            validator: () => [],
          },
        }];
      },
    }),
  );

  const boolVariants = [
    "True",
    "true",
    "TRUE",
    "1",
  ];

  for (const boolVariant of boolVariants) {
    const response = await routerHandler(
      new Request(
        `http://localhost/test?bool=${boolVariant}`,
      ),
    );

    const result = await response.json();

    assertEquals(result, {
      bool: true,
    });
  }
});
