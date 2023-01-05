import { convertUrlPatternToOpenApiPath } from "./convertUrlPatternToOpenApiPath.ts";
import { assertStrictEquals } from "../../deps.ts";

Deno.test("Convert operation path with one parameter to openapi path.", () => {
  assertStrictEquals(
    convertUrlPatternToOpenApiPath("/path/:id"),
    "/path/{id}",
  );
});

Deno.test("Convert operation path with multiple parameters to openapi path.", () => {
  assertStrictEquals(
    convertUrlPatternToOpenApiPath(
      "/path/:first/path/:second",
    ),
    "/path/{first}/path/{second}",
  );
});
