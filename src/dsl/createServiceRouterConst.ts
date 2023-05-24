import { safeArray } from "../utils/index.ts";
import { DslService } from "./DslService.ts";

export function createServiceRouterConst(service: DslService) {
  const overviewHtmlLine = service.overviewHtml
    ? `overviewHtml: \`${service.overviewHtml}\`,`
    : "";

  const authHtmlLine = service.authHtml
    ? `authHtml: \`${service.authHtml}\`,`
    : "";

  const apiKeyLine = service.authApiKeyHeaderName
    ? `authApiKeyHeaderName: "${service.authApiKeyHeaderName}",`
    : "";

  const cookieLine = service.authCookieName
    ? `authCookieName: "${service.authCookieName}",`
    : "";

  const permittedCorsOrigins = safeArray(service.permittedCorsOrigins)
    .map((origin) => `"${origin}"`)
    .join(", ");

  return {
    name: "serviceRouter",
    exported: true,
    outputGeneration: 4,
    value: `() => router({
      depsPath: "${service.depsPath}",
      title: "${service.title}",
      description: "${service.description}",
      overviewHtml: "${service.title}",
      ${overviewHtmlLine}
      ${authHtmlLine}
      ${apiKeyLine}
      ${cookieLine}
      permittedCorsOrigins: [${permittedCorsOrigins}],
      namedTypes: allRuntimeTypes,
      middleware: allMiddleware,
      payloadMiddleware: allPayloadMiddleware,
      operations: allOperations,
    })`,
  };
}
