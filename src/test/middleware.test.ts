// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { createOperation, createRouterHandler } from "./shared.test.ts";

Deno.test("Process an operation that uses middleware functions.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async (_req, ctx) => {
        return {
          body: {
            foo: ctx.get("foo"),
            hello: ctx.get("hello"),
          },
        };
      },
      setup: (op) => {
        op.middlewares = [
          async (_req, ctx, next) => {
            ctx.set("foo", "bar");
            return await next();
          },
          async (_req, ctx, next) => {
            ctx.set("hello", "world");
            return await next();
          },
        ];
      },
    }),
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { foo: "bar", hello: "world" });
});

Deno.test("Fail to process an operation where a middleware calls next twice.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        return {};
      },
      setup: (op) => {
        op.middlewares = [
          async (_req, _ctx, next) => {
            await next();
            return await next();
          },
        ];
      },
    }),
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  assertEquals(response.status, 500);
});
