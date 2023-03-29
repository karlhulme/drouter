import { ServiceConfig } from "../interfaces/index.ts";

/**
 * Appends a set of CORs headers to the given headers object.
 * @param responseHeaders The current set of headers that this
 * method can append to.
 * @param config The configuration for the service.
 * @param underlyingRequest The underlying request.
 */
export function appendCorsHeaders(
  responseHeaders: Headers,
  config: ServiceConfig,
  underlyingRequest: Request,
) {
  responseHeaders.append(
    "allow",
    "DELETE, GET, OPTIONS, PATCH, POST, PUT",
  );

  if (
    Array.isArray(config.permittedCorsOrigins) &&
    config.permittedCorsOrigins.length > 0
  ) {
    const requestOrigin = underlyingRequest.headers.get("origin") || "";

    const matchedOrigin = config.permittedCorsOrigins
      .find((pco) => pco.toLowerCase() === requestOrigin.toLowerCase());

    responseHeaders.append(
      "Access-Control-Allow-Methods",
      "DELETE, GET, OPTIONS, PATCH, POST, PUT",
    );

    responseHeaders.append(
      "Access-Control-Allow-Credentials",
      "true",
    );

    responseHeaders.append(
      "Access-Control-Allow-Origin",
      matchedOrigin || config.permittedCorsOrigins[0],
    );

    responseHeaders.append(
      "Access-Control-Allow-Headers",
      "Set-Cookie,Api-Version,Content-Type",
    );
  }
}
