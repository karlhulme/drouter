import { safeArrayLength } from "./safeArrayLength.ts";
import { assertStrictEquals } from "../../deps.ts";

Deno.test("Safe array length on an array.", () => {
  assertStrictEquals(safeArrayLength([]), 0);
  assertStrictEquals(safeArrayLength(["foo", "bar"]), 2);
});

Deno.test("Safe array length on an undefined.", () => {
  assertStrictEquals(safeArrayLength(), 0);
  assertStrictEquals(safeArrayLength(null), 0);
});
