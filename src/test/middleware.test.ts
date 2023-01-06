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
      setup: () => {},
    }),
    (sc) => {
      sc.middleware = [
        {
          process: async (_req, ctx, _op, next) => {
            ctx.set("foo", "bar");
            return await next();
          },
          specify: () => ({
            headers: [],
            queryParams: [],
            responseHeaders: [],
          }),
        },
        {
          process: async (_req, ctx, _op, next) => {
            ctx.set("hello", "world");
            return await next();
          },
          specify: () => ({
            headers: [],
            queryParams: [],
            responseHeaders: [],
          }),
        },
      ],
        sc.payloadMiddleware = [
          {
            process: async (_req, ctx, _op, next) => {
              ctx.set("another", "one");
              return await next();
            },
            specify: () => ({
              headers: [],
              queryParams: [],
              responseHeaders: [],
            }),
          },
          {
            process: async (_req, ctx, _op, next) => {
              ctx.set("appears", "hre");
              return await next();
            },
            specify: () => ({
              headers: [],
              queryParams: [],
              responseHeaders: [],
            }),
          },
        ];
    },
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
      setup: () => {},
    }),
    (sc) => {
      sc.middleware = [
        {
          process: async (_req, ctx, _op, next) => {
            ctx.set("foo", "bar");
            await next();
            return await next();
          },
          specify: () => ({
            headers: [],
            queryParams: [],
            responseHeaders: [],
          }),
        },
      ];
    },
  );

  const response = await routerHandler(new Request("http://localhost/test"));
  assertEquals(response.status, 500);
});
