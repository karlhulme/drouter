import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api key is supplied
 * but that key is not valid.
 */
export function apiKeyNotValidResponse() {
  return errorResponse(
    401,
    "/common",
    "api-key-not-valid",
    "An x-api-key header was included in the request but that value was not valid.",
  );
}
