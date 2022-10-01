// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { OperationContext } from "../interfaces/OperationContext.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Generate context and see that context in an operation.", async () => {
  let preProcessorCalled = false;
  let handlerCalled = false;

  const preProcessor = async function (req: Request, ctx: OperationContext) {
    ctx.set("mthd", "*" + req.method + "*");
    preProcessorCalled = true;
  };

  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (_req, ctx) => {
        assertEquals(ctx.get("mthd"), "*GET*");
        handlerCalled = true;
        return {};
      },
      setup: () => {},
    }),
    (sc) => {
      sc.preProcessors = [preProcessor];
    },
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  assertEquals(response.status, 200);
  assertEquals(preProcessorCalled, true);
  assertEquals(handlerCalled, true);
});
