import { safeArray } from "../utils/safeArray.ts";
import { DslMiddleware } from "./DslMiddleware.ts";
import { buildCommonFailureDefinition } from "./buildCommonFailureDefinition.ts";
import { stringArrayToTypescriptUnion } from "./stringArrayToTypescriptUnion.ts";

export function createMiddlewareConst(middleware: DslMiddleware) {
  const mwHeaders = safeArray(middleware.headers);
  const mwQParams = safeArray(middleware.queryParams);
  const mwOutHeaders = safeArray(middleware.responseHeaders);
  const mwFailDefs = safeArray(middleware.responseFailureDefinitions)
    .map(buildCommonFailureDefinition);

  return {
    name: `${middleware.name}Middleware`,
    exported: true,
    outputGeneration: 2,
    typeName: `ServiceMiddleware<
      ${stringArrayToTypescriptUnion(mwHeaders.map((h) => h.name))},
      ${stringArrayToTypescriptUnion(mwQParams.map((qp) => qp.name))},
      ${stringArrayToTypescriptUnion(mwOutHeaders.map((h) => h.name))},
      ${stringArrayToTypescriptUnion(mwFailDefs.map((f) => f.type))},
    >`,
    value: `{
      name: "${middleware.name}",
      usesAuthApiKey: ${middleware.usesAuthApiKey ? "true" : "false"},
      usesAuthCookie: ${middleware.usesAuthCookie ? "true" : "false"},
    }`,
  };
}
