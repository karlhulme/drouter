import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when a requested resource was not found.
 */
export function resourceNotFoundResponse() {
  return errorResponse(
    404,
    "/common",
    "operation-not-found",
    "The requested operation was not found.",
  );
}
