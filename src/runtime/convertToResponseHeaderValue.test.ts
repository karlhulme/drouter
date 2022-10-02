import { convertToResponseHeaderValue } from "./convertToResponseHeaderValue.ts";
import { assertStrictEquals } from "../../deps.ts";

Deno.test("Convert values for response headers.", () => {
  assertStrictEquals(
    convertToResponseHeaderValue("hello"),
    "hello",
  );

  assertStrictEquals(
    convertToResponseHeaderValue(1234),
    "1234",
  );

  assertStrictEquals(
    convertToResponseHeaderValue(true),
    "true",
  );

  assertStrictEquals(
    convertToResponseHeaderValue(false),
    "false",
  );

  assertStrictEquals(
    convertToResponseHeaderValue({ foo: "bar" }),
    `{"foo":"bar"}`,
  );

  assertStrictEquals(
    convertToResponseHeaderValue([1, 2]),
    "[1,2]",
  );

  assertStrictEquals(
    convertToResponseHeaderValue(undefined),
    "",
  );
});
