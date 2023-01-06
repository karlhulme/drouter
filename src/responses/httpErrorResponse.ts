import { HttpError } from "../index.ts";
import { errorResponse } from "./errorResponse.ts";

/**
 * Returns an error response based on an HttpError instance.
 * @param err An HTTP error.
 * @param additionalHeaders Additional headers to be appended to the response.
 */
export function httpErrorResponse(
  err: HttpError,
  additionalHeaders?: HeadersInit,
) {
  return errorResponse(
    err.code,
    err.errorCode,
    err.description,
    err.details,
    additionalHeaders,
  );
}
