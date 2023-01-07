import { ServiceConfig } from "../interfaces/index.ts";
import { buildOpenApiSpec } from "./buildOpenApiSpec.ts";

/**
 * Returns an OpenAPI specification.
 * @param config The configuration for the service.
 * @param namedTypes An array of named types.
 */
export function openApiResponse(config: ServiceConfig) {
  const openApi = buildOpenApiSpec(config);

  return new Response(JSON.stringify(openApi, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });
}
