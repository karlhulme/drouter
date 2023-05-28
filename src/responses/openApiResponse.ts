import { ServiceConfig } from "../interfaces/index.ts";
import { todayString } from "../utils/todayString.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

/**
 * Returns an OpenAPI specification.
 * @param config The configuration for the service.
 * @param namedTypes An array of named types.
 */
export function openApiResponse(config: ServiceConfig, url: URL) {
  const apiVersion = url.searchParams.get("api-version") || todayString();

  const openApi = buildOpenApiSpec(config, {
    apiVersion,
  });

  return new Response(JSON.stringify(openApi, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });
}
