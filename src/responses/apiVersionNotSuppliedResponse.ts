import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api version is not supplied.
 */
export function apiVersionNotSuppliedResponse() {
  return errorResponse(
    400,
    "API_VERSION_NOT_SUPPLIED",
    "You must supply an api-version header.  Valid values are: 2021-01-01.",
  );
}
