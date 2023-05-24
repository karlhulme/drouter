import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api version header is not supplied.
 * This is required because the versioning system depends on requests
 * being made for a specific version of the API so that requests
 * and responses can be adapted accordingly.
 */
export function apiVersionNotSuppliedResponse() {
  return errorResponse(
    400,
    "/err/apiVersionNotSupplied",
    "The request did not contain an api-version header in the form YYYY-MM-DD.",
  );
}
