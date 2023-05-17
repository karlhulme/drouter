import { errorResponse } from "./errorResponse.ts";

/**
 * Returns a response for when an internal server error occurs.
 * @param underlyingRequest The request being processed.
 * @param additionalHeaders Additional headers to be appended to the response.
 */
export function internalServerErrorResponse(
  underlyingRequest: Request,
  additionalHeaders?: HeadersInit,
) {
  return errorResponse(
    500,
    "/errors/common/internalServerError",
    "Unexpected error raised processing request.",
    undefined,
    {
      method: underlyingRequest.method,
      url: underlyingRequest.url,
    },
    additionalHeaders,
  );
}
