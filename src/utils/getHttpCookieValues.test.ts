// deno-lint-ignore-file require-await
import { assertEquals } from "../../deps.ts";
import { getHttpCookieValues } from "./getHttpCookieValues.ts";

Deno.test("Parse cookies from a string.", async () => {
  const values = getHttpCookieValues("foo=bar; hello=world;");

  assertEquals(values, [{
    name: "foo",
    value: "bar",
  }, {
    name: "hello",
    value: "world",
  }]);
});

Deno.test("Parse cookies from an undefined or null variable.", async () => {
  assertEquals(getHttpCookieValues(null), []);
  assertEquals(getHttpCookieValues(), []);
});
