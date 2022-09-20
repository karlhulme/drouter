import { ServiceConfig } from "../interfaces/index.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

/**
 * Returns an OpenAPI specification.
 * @param config The configuration for the service.
 */
export function openApiResponse(config: ServiceConfig) {
  const openApi = buildOpenApiSpec(config);

  return new Response(JSON.stringify(openApi), {
    headers: {
      "content-type": "application/json",
    },
  });
}
