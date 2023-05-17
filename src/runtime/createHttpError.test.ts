import { createHttpError } from "./createHttpError.ts";
import { assertEquals } from "../../deps.ts";
import { Operation } from "../index.ts";

const op: Operation = {
  name: "Do something",
  operationId: "doSomething",
  apiVersion: "2021-01-01",
  method: "POST",
  tags: [],
  flags: [],
  // deno-lint-ignore require-await
  handler: async () => ({}),
  urlPattern: "/base/:id/leaf/:leafId",
  responseFailureDefinitions: [{
    code: 456,
    summary: "A specific type of problem.",
    localType: "aKnownType",
  }],
};

Deno.test("Produce http error for known error local type.", () => {
  const err = createHttpError(
    op,
    "aKnownType",
    "Specific issue with this call.",
    { foo: 123, bar: true },
  );

  assertEquals(err.code, 456);
  assertEquals(err.title, "A specific type of problem.");
  assertEquals(err.type, "/errors/base/-/leaf/-/aKnownType");
  assertEquals(err.detail, "Specific issue with this call.");
  assertEquals(err.properties?.foo, 123);
  assertEquals(err.properties?.bar, true);
});

Deno.test("Produce http error for unknown error local type.", () => {
  const { responseFailureDefinitions: _, ...opWithoutFailureDefs } = op;

  const err = createHttpError(
    opWithoutFailureDefs,
    "unknownType",
    "Specific issue with this call.",
    { foo: 123, bar: true },
  );

  assertEquals(err.code, 500);
  assertEquals(err.title, "An undocumented error has been raised.");
  assertEquals(err.type, "/errors/common/unexpectedError");
  assertEquals(
    err.detail,
    "An error with local type name of unknownType was raised.",
  );
});
