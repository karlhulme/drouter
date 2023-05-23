import { assertStrictEquals } from "../../deps.ts";
import { stringArrayToTypescriptUnion } from "./stringArrayToTypescriptUnion.ts";

Deno.test("Convert populated array into typescript union.", () => {
  assertStrictEquals(
    stringArrayToTypescriptUnion(["a", "b", "c"]),
    `"a"|"b"|"c"`,
  );
});

Deno.test("Convert empty array to Typescript never.", () => {
  assertStrictEquals(stringArrayToTypescriptUnion([]), "never");
});
