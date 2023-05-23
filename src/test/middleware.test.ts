// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

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
        op.middleware = [{
          name: "mw1",
        }, {
          name: "mw2",
          flags: [],
        }, {
          name: "mw4",
          flags: [],
        }];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          process: async (_req, ctx, _op, _flags, next) => {
            ctx.set("foo", "bar");
            return await next();
          },
          headers: [],
          queryParams: [],
          responseHeaders: [],
          failureDefinitions: [],
        },
        {
          name: "mw2",
          process: async (_req, ctx, _op, _flags, next) => {
            ctx.set("hello", "world");
            return await next();
          },
          headers: [],
          queryParams: [],
          responseHeaders: [],
          failureDefinitions: [],
        },
      ],
        sc.payloadMiddleware = [
          {
            name: "mw3",
            process: async (_req, ctx, _op, _flags, next) => {
              ctx.set("another", "one");
              return await next();
            },
            headers: [],
            queryParams: [],
            responseHeaders: [],
            failureDefinitions: [],
          },
          {
            name: "mw4",
            process: async (_req, ctx, _op, _flags, next) => {
              ctx.set("appears", "hre");
              return await next();
            },
            headers: [],
            queryParams: [],
            responseHeaders: [],
            failureDefinitions: [],
          },
        ];
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
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
        op.middleware = [{
          name: "mw1",
        }];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          process: async (_req, ctx, _op, _flags, next) => {
            ctx.set("foo", "bar");
            await next();
            return await next();
          },
          headers: [],
          queryParams: [],
          responseHeaders: [],
        },
      ];
    },
  );

  const response = await routerHandler(
    new Request("http://localhost/test", stdReqInit),
    stdReqInfo,
  );
  assertEquals(response.status, 500);
});
