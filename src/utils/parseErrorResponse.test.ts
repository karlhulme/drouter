import { parseErrorResponse } from "./parseErrorResponse.ts";
import { assertEquals, assertStrictEquals } from "../../deps.ts";

Deno.test("Parse a valid error response with details.", () => {
  const err = parseErrorResponse(
    'MY_ERROR 400 This is my error.\n{"foo":"bar"}',
  );

  assertStrictEquals(err.status, 400);
  assertStrictEquals(err.errorCode, "MY_ERROR");
  assertStrictEquals(err.description, "This is my error.");
  assertEquals(err.details, { "foo": "bar" });
});

Deno.test("Parse a valid error response without details.", () => {
  const err = parseErrorResponse(
    "MY_ERROR 400 This is my error.",
  );

  assertStrictEquals(err.status, 400);
  assertStrictEquals(err.errorCode, "MY_ERROR");
  assertStrictEquals(err.description, "This is my error.");
  assertEquals(err.details, undefined);
});

Deno.test("Parse an invalid error response.", () => {
  const err = parseErrorResponse(
    "Something went wrong.",
  );

  assertStrictEquals(err.status, 500);
  assertStrictEquals(err.errorCode, "INTERNAL_SERVER_ERROR");
  assertStrictEquals(err.description, "Unable to parse errorResponse.");
  assertEquals(err.details, undefined);
});
