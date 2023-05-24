import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an operation has not been implemented.
 */
export function operationNotImplementedResponse() {
  return errorResponse(
    501,
    "/err/operationNotImplemented",
    "The requested operation has not been implemented yet.",
  );
}
