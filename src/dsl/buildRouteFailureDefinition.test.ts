import { buildRouteFailureDefinition } from "./buildRouteFailureDefinition.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Build a route failure definition.", () => {
  assertEquals(
    buildRouteFailureDefinition("getSomeValue", {
      code: 123,
      summary: "a summary",
      localType: "someError",
      fromMiddleware: "abc",
    }),
    {
      code: 123,
      summary: "a summary",
      type: "/err/getSomeValue/someError",
      fromMiddleware: "abc",
    },
  );
});
