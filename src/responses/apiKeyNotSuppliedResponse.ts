import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api key is not supplied.
 */
export function apiKeyNotSuppliedResponse() {
  return errorResponse(
    401,
    "/common",
    "api-key-not-supplied",
    "An x-api-key header was not included in the request.",
  );
}
