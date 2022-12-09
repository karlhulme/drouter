import { OperationError, ServiceConfig } from "../interfaces/index.ts";
import { appendCorsHeaders } from "./appendCorsHeaders.ts";

/**
 * Returns a response for an error.  The format of the message is
 * error code, followed by colon, followed by description, followed
 * by new line character, followed by details object.  For example
 * ERROR_CODE: description\n{"foo": "bar"}.
 * @param err An operation error.
 * @param config The service configuration.
 * @param underlyingRequest The underlying client request.
 */
export function createErrorResponse(
  err: OperationError,
  config: ServiceConfig,
  underlyingRequest: Request,
) {
  const headers = new Headers();

  headers.append("content-type", "application/json");
  appendCorsHeaders(headers, config, underlyingRequest);

  const cleanDescription = err.description.replaceAll("\n", "");

  const detailsJson = typeof err.details === "object"
    ? JSON.stringify(err.details)
    : "";

  return new Response(
    `${err.errorCode}: ${cleanDescription}\n${detailsJson}`,
    {
      status: err.status,
      headers,
    },
  );
}
