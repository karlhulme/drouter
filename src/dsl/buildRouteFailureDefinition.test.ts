import { buildRouteFailureDefinition } from "./buildRouteFailureDefinition.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Build a route failure definition.", () => {
  assertEquals(
    buildRouteFailureDefinition("/path/:id/other", "GET", {
      code: 123,
      summary: "a summary",
      localType: "some-error",
    }),
    {
      code: 123,
      summary: "a summary",
      type: "/errors/get/path/-/other/some-error",
    },
  );
});
