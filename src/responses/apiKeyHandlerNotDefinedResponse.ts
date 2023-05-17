import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an api key handler has not
 * been defined.
 */
export function apiKeyHandlerNotDefinedResponse() {
  return errorResponse(
    501,
    "/errors/common/apiKeyHandlerNotImplemented",
    "A handler for the x-api-key has not been defined.",
  );
}
