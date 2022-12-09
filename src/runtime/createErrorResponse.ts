import { OperationError, ServiceConfig } from "../interfaces/index.ts";
import { appendCorsHeaders } from "./appendCorsHeaders.ts";

/**
 * Returns a response for an error.
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

  return new Response(
    JSON.stringify({
      errorCode: err.errorCode,
      description: err.description,
      details: err.details,
    }),
    {
      status: err.status,
      headers,
    },
  );
}
