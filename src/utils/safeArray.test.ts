import { safeArray } from "./safeArray.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Safe array length on an array.", () => {
  assertEquals(safeArray([]), []);
  assertEquals(safeArray(["foo", "bar"]), ["foo", "bar"]);
});

Deno.test("Safe array length on an undefined.", () => {
  assertEquals(safeArray(), []);
  assertEquals(safeArray(null), []);
});
