import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api key handler has not
 * been defined.
 */
export function apiKeyHandlerNotDefinedResponse() {
  return errorResponse(
    501,
    "/common",
    "api-key-handler-not-implemented",
    "A handler for the x-api-key has not been defined.",
  );
}
