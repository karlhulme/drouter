import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api key is not supplied.
 */
export function apiKeyNotSuppliedResponse() {
  return errorResponse(
    401,
    "API_KEY_NOT_SUPPLIED",
    "An x-api-key header was not included in the request.",
  );
}
