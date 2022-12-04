import { assertStrictEquals } from "../../deps.ts";
import { router, ServiceConfig } from "../index.ts";

const emptyServiceConfig: ServiceConfig = {
  title: "Test service",
  description: "The test service.",
  version: "1.0.0",
  operations: [],
  namedTypes: [],
};

Deno.test("An OPTIONS request without permitted origin domains.", async () => {
  const routerHandler = router(emptyServiceConfig);
  const response = await routerHandler(
    new Request("http://localhost/some/url", {
      method: "OPTIONS",
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
        "Origin": "HTTPS://MYDOMAIN.COM",
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
  assertStrictEquals(allowHeaders, "Set-Cookie");
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
        "Origin": "https://other.com",
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
    }),
  );

  const corsAllowOrigin = response.headers.get("Access-Control-Allow-Origin");
  assertStrictEquals(corsAllowOrigin, "http://localhost:1234");
});
