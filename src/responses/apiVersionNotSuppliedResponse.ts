import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api version is not supplied.
 */
export function apiVersionNotSuppliedResponse() {
  return errorResponse(
    400,
    "API_VERSION_NOT_SUPPLIED",
    "You must supply an api-version header in the form YYYY-MM-DD.",
  );
}
