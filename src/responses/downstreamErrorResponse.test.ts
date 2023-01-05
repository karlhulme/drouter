import { downstreamErrorResponse } from "./downstreamErrorResponse.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Exercise the downstream error response.", () => {
  const response = downstreamErrorResponse();
  assertEquals(typeof response, "object");
});
