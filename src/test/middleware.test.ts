// deno-lint-ignore-file require-await
import { assertStringIncludes } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { assertEquals } from "../../deps.ts";
import {
  createOperation,
  createRouterHandler,
  stdReqInfo,
  stdReqInit,
} from "./shared.test.ts";

Deno.test("An operation can trigger the processing of associated middleware functions.", async () => {
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
        op.middleware = ["mw1", "mw2", "mw4"];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          handler: async (_req, ctx, _op, next) => {
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
          handler: async (_req, ctx, _op, next) => {
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
            handler: async (_req, ctx, _op, next) => {
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
            handler: async (_req, ctx, _op, next) => {
              ctx.set("appears", "here");
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
        op.middleware = ["mw1"];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          handler: async (_req, ctx, _op, next) => {
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

Deno.test("A middleware function can access all the request headers.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        return {
          body: {},
        };
      },
      setup: (op) => {
        op.middleware = ["mw1"];
        op.requestHeaders = [{
          name: "header1",
          summary: "A string",
          isRequired: true,
          type: {
            name: "std/maxString",
            referencedSchemaTypes: [],
            schema: {
              type: "string",
            },
            underlyingType: "string",
            validator: () => [],
          },
        }, {
          name: "header2",
          summary: "A number",
          isRequired: true,
          type: {
            name: "std/positiveInteger",
            referencedSchemaTypes: [],
            schema: {
              type: "number",
            },
            underlyingType: "number",
            validator: () => [],
          },
        }, {
          name: "header3",
          summary: "A boolean",
          isRequired: true,
          type: {
            name: "std/bool",
            referencedSchemaTypes: [],
            schema: {
              type: "boolean",
            },
            underlyingType: "boolean",
            validator: () => [],
          },
        }, {
          name: "header4",
          summary: "An object",
          isRequired: true,
          type: {
            name: "std/plainObject",
            referencedSchemaTypes: [],
            schema: {
              type: "object",
            },
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          handler: async (req, _ctx, _op, next) => {
            req.headers.getAllValues();
            req.headers.getRequiredString("header1");
            req.headers.getOptionalString("header1");
            req.headers.getRequiredNumber("header2");
            req.headers.getOptionalNumber("header2");
            req.headers.getRequiredBoolean("header3");
            req.headers.getOptionalBoolean("header3");
            req.headers.getRequiredObject("header4");
            req.headers.getOptionalObject("header4");
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
    new Request("http://localhost/test", {
      ...stdReqInit,
      headers: {
        ...stdReqInit.headers,
        "header1": "value1",
        "header2": "123",
        "header3": "true",
        "header4": `{ "foo": "bar" }`,
      },
    }),
    stdReqInfo,
  );

  assertEquals(response.status, 200);
});

Deno.test("A middleware function can access all the query params.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        return {
          body: {},
        };
      },
      setup: (op) => {
        op.middleware = ["mw1"];
        op.requestQueryParams = [{
          name: "qp1",
          summary: "A string",
          isRequired: true,
          type: {
            name: "std/maxString",
            referencedSchemaTypes: [],
            schema: {
              type: "string",
            },
            underlyingType: "string",
            validator: () => [],
          },
        }, {
          name: "qp2",
          summary: "A number",
          isRequired: true,
          type: {
            name: "std/positiveInteger",
            referencedSchemaTypes: [],
            schema: {
              type: "number",
            },
            underlyingType: "number",
            validator: () => [],
          },
        }, {
          name: "qp3",
          summary: "A boolean",
          isRequired: true,
          type: {
            name: "std/bool",
            referencedSchemaTypes: [],
            schema: {
              type: "boolean",
            },
            underlyingType: "boolean",
            validator: () => [],
          },
        }, {
          name: "qp4",
          summary: "An object",
          isRequired: true,
          type: {
            name: "std/plainObject",
            referencedSchemaTypes: [],
            schema: {
              type: "object",
            },
            underlyingType: "object",
            validator: () => [],
          },
        }];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          handler: async (req, _ctx, _op, next) => {
            req.queryParams.getAllValues();
            req.queryParams.getRequiredString("qp1");
            req.queryParams.getOptionalString("qp1");
            req.queryParams.getRequiredNumber("qp2");
            req.queryParams.getOptionalNumber("qp2");
            req.queryParams.getRequiredBoolean("qp3");
            req.queryParams.getOptionalBoolean("qp3");
            req.queryParams.getRequiredObject("qp4");
            req.queryParams.getOptionalObject("qp4");
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
    new Request(
      "http://localhost/test?qp1=value1&qp2=123&qp3=true&qp4=%7B%22foo%22%3A%22bar%22%7D",
      stdReqInit,
    ),
    stdReqInfo,
  );

  assertEquals(response.status, 200);
});

Deno.test("A middleware function can raise errors.", async () => {
  const routerHandler = createRouterHandler(
    createOperation({
      handler: async () => {
        return {
          body: {},
        };
      },
      setup: (op) => {
        op.middleware = ["mw1"];
        op.responseFailureDefinitions = [{
          code: 456,
          summary: "An error",
          type: "err1",
          fromMiddleware: "mw1",
        }];
      },
    }),
    (sc) => {
      sc.middleware = [
        {
          name: "mw1",
          handler: async (req, _ctx, _op, _next) => {
            throw req.error("err1", "additional info");
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
    new Request(
      "http://localhost/test",
      stdReqInit,
    ),
    stdReqInfo,
  );

  assertEquals(response.status, 456);
  assertStringIncludes(await response.text(), "additional info");
});
