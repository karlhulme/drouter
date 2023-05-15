import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api version is not supplied.
 */
export function apiVersionNotSuppliedResponse() {
  return errorResponse(
    400,
    "/common",
    "api-version-not-supplied",
    "You must supply an api-version header in the form YYYY-MM-DD.",
  );
}
