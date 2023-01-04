import { HttpError, ServiceConfig } from "../interfaces/index.ts";
import { appendCorsHeaders } from "./appendCorsHeaders.ts";

/**
 * Returns a response for an error.  The format of the message is
 * error code, space, status, space, description, new line character,
 * optional JSON.stringified details object.  For example
 * ERROR_CODE 400 This was the problem.\n{"foo": "bar"}.
 * @param err An operation error.
 * @param config The service configuration.
 * @param underlyingRequest The underlying client request.
 */
export function createErrorResponse(
  err: HttpError,
  config: ServiceConfig,
  underlyingRequest: Request,
) {
  const headers = new Headers();

  headers.append("content-type", "text/html;charset=utf-8");
  appendCorsHeaders(headers, config, underlyingRequest);

  const cleanDescription = err.description.replaceAll("\n", "");

  const cleanDetails = err.details || "";

  return new Response(
    // Put a new line on the end, so that clients capable of reading
    // structured error responses know where the structured part ends.
    `${err.errorCode} ${err.code} ${cleanDescription}\n${cleanDetails}`,
    {
      status: err.code,
      headers,
    },
  );
}
