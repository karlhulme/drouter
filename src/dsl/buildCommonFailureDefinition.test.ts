import { buildCommonFailureDefinition } from "./buildCommonFailureDefinition.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Build a common failure definition.", () => {
  assertEquals(
    buildCommonFailureDefinition({
      code: 123,
      summary: "a summary",
      localType: "some-error",
    }),
    {
      code: 123,
      summary: "a summary",
      type: "/errors/common/some-error",
    },
  );
});
