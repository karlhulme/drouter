import { assertEquals } from "../../deps.ts";
import { getLatestVersion } from "./getLatestVersion.ts";

Deno.test("Get the latest version from a set.", () => {
  const v = getLatestVersion(["2020-01-01", "2021-01-01", "2019-01-01"]);
  assertEquals(v, "2021-01-01");
});

Deno.test("Get the latest version from a empty set.", () => {
  const v = getLatestVersion([]);
  assertEquals(v, "N/A");
});
