import { assertStrictEquals } from "../../deps.ts";
import { router, ServiceConfig } from "../index.ts";

const emptyServiceConfig: ServiceConfig = {
  title: "Test service",
  description: "The test service.",
  middleware: [],
  payloadMiddleware: [],
  operations: [],
  namedTypes: [],
};

Deno.test("An OPTIONS request without permitted origin domains.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/some/url", {
      method: "OPTIONS",
      headers: {
        "api-version": "2000-01-01",
      },
    }),
  );
  const allowHeader = response.headers.get("Allow");
  assertStrictEquals(allowHeader, "DELETE, GET, OPTIONS, PATCH, POST, POST");

  const corsMethods = response.headers.get("Access-Control-Allow-Methods");
  assertStrictEquals(corsMethods, null);
});

Deno.test("An OPTIONS request with a permitted origin domain that matches the request.", async () => {
  const routerHandler = router({
    ...emptyServiceConfig,
    permittedCorsOrigins: [
      "http://localhost:1234",
      "https://mydomain.com",
    ],
  });

  const response = await routerHandler(
    new Request("http://localhost/some/url", {
      method: "OPTIONS",
      headers: {
        "origin": "HTTPS://MYDOMAIN.COM",
        "api-version": "2000-01-01",
      },
    }),
  );

  const allow = response.headers.get("Allow");
  assertStrictEquals(allow, "DELETE, GET, OPTIONS, PATCH, POST, POST");

  const corsMethods = response.headers.get("Access-Control-Allow-Methods");
  assertStrictEquals(corsMethods, "DELETE, GET, OPTIONS, PATCH, POST, POST");

  const corsCreds = response.headers.get("Access-Control-Allow-Credentials");
  assertStrictEquals(corsCreds, "true");

  const corsAllowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertStrictEquals(corsAllowOrigin, "HTTPS://MYDOMAIN.COM");

  const allowHeaders = response.headers.get("Access-Control-Allow-Headers");
  assertStrictEquals(allowHeaders, "Set-Cookie,Api-Version");
});

Deno.test("An OPTIONS request with permitted origin domains that do not match the request.", async () => {
  const routerHandler = router({
    ...emptyServiceConfig,
    permittedCorsOrigins: [
      "http://localhost:1234",
      "https://mydomain.com",
    ],
  });

  const response = await routerHandler(
    new Request("http://localhost/some/url", {
      method: "OPTIONS",
      headers: {
        "origin": "https://other.com",
        "api-version": "2000-01-01",
      },
    }),
  );

  const corsAllowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertStrictEquals(corsAllowOrigin, "http://localhost:1234");
});

Deno.test("An OPTIONS request without an origin header specified in the request.", async () => {
  const routerHandler = router({
    ...emptyServiceConfig,
    permittedCorsOrigins: [
      "http://localhost:1234",
      "https://mydomain.com",
    ],
  });

  const response = await routerHandler(
    new Request("http://localhost/some/url", {
      method: "OPTIONS",
      headers: {
        "api-version": "2000-01-01",
      },
    }),
  );

  const corsAllowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertStrictEquals(corsAllowOrigin, "http://localhost:1234");
});
