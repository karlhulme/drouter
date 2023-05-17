import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when a requested resource was not found.
 */
export function resourceNotFoundResponse() {
  return errorResponse(
    404,
    "/errors/common/operationNotFound",
    "The requested operation was not found.",
  );
}
