import { parseErrorResponse } from "./parseErrorResponse.ts";
import { assertStrictEquals } from "../../deps.ts";

Deno.test("Parse a valid error response.", () => {
  const err = parseErrorResponse(
    "MY_ERROR 400 This is my error.",
  );

  assertStrictEquals(err.code, 400);
  assertStrictEquals(err.errorCode, "MY_ERROR");
  assertStrictEquals(err.description, "This is my error.");
  assertStrictEquals(err.details, "");
});

Deno.test("Parse a valid error response with additional appended.", () => {
  const err = parseErrorResponse(
    'MY_VERBOSE_ERROR 419 This is my verbose error.\n{"foo":"bar"}\n\nSome more text',
  );

  assertStrictEquals(err.code, 419);
  assertStrictEquals(err.errorCode, "MY_VERBOSE_ERROR");
  assertStrictEquals(err.description, "This is my verbose error.");
  assertStrictEquals(err.details, '{"foo":"bar"}\n\nSome more text');
});

Deno.test("Parse an invalid error response.", () => {
  const err = parseErrorResponse(
    "Something went wrong.",
  );

  assertStrictEquals(err.code, 500);
  assertStrictEquals(err.errorCode, "INTERNAL_SERVER_ERROR");
  assertStrictEquals(err.description, "Unable to parse errorResponse.");
});
