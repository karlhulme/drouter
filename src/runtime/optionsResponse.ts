import { ServiceConfig } from "../interfaces/index.ts";
import { appendCorsHeaders } from "./appendCorsHeaders.ts";

/**
 * Returns an options response.
 * @param config The configuration for the service.
 * @param underlyingRequest The underlying request.
 */
export function optionsResponse(
  config: ServiceConfig,
  underlyingRequest: Request,
) {
  const headers = new Headers();

  appendCorsHeaders(headers, config, underlyingRequest);

  return new Response("", { headers });
}
