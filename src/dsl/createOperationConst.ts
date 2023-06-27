import {
  capitalizeFirstLetter,
  getSystemFromTypeString,
  getTypeFromTypeString,
  TypescriptTreeConstDeclaration,
} from "../../deps.ts";
import { safeArray } from "../utils/index.ts";
import { DslMiddleware } from "./DslMiddleware.ts";
import { DslRoute, DslRouteMethod } from "./DslRoute.ts";
import { buildCommonFailureDefinition } from "./buildCommonFailureDefinition.ts";
import { buildRouteFailureDefinition } from "./buildRouteFailureDefinition.ts";
import { stringArrayToTypescriptUnion } from "./stringArrayToTypescriptUnion.ts";

export function createOperationConst(
  route: DslRoute,
  method: DslRouteMethod,
  mwares: DslMiddleware[],
): TypescriptTreeConstDeclaration {
  // Combine the headers from the route and the associated middlewares.
  const methodHeaders = mwares.map((m) =>
    safeArray(m.headers).map((h) => ({
      ...h,
      fromMiddleware: m.name as string | null,
    }))
  )
    .flat()
    .concat(
      safeArray(method.headers).map((h) => ({ ...h, fromMiddleware: null })),
    );

  // Combine the query params from the route and the associated middlewares.
  const methodQueryParams = mwares.map((m) =>
    safeArray(m.queryParams).map((qp) => ({
      ...qp,
      fromMiddleware: m.name as string | null,
    }))
  )
    .flat()
    .concat(
      safeArray(method.queryParams).map((qp) => ({
        ...qp,
        fromMiddleware: null,
      })),
    );

  // Combine the response headers from the route and the associated middlewares
  const methodOutHeaders = mwares.map((m) =>
    safeArray(m.responseHeaders).map((h) => ({
      ...h,
      fromMiddleware: m.name as string | null,
    }))
  )
    .flat()
    .concat(
      safeArray(method.responseHeaders).map((h) => ({
        ...h,
        fromMiddleware: null,
      })),
    );

  // Combine the failure codes from the route and the associated middlewares
  const methodFailureCodes = mwares.map((m) =>
    safeArray(m.responseFailureDefinitions).map((fd) => ({
      ...fd,
      fromMiddleware: m.name as string | null,
    }))
  )
    .flat()
    .map(buildCommonFailureDefinition)
    .concat(
      safeArray(method.responseFailureDefinitions).map((fd) => ({
        ...fd,
        fromMiddleware: null,
      })).map((fd) => buildRouteFailureDefinition(method.operationId, fd)),
    );
  const methodMiddleware = safeArray(method.middleware);

  let requestBodyTypeParam = "void";
  let requestBodyTypeLine = "";

  if (Array.isArray(method.requestBodyProperties)) {
    requestBodyTypeParam = `${capitalizeFirstLetter(route.system)}${
      capitalizeFirstLetter(method.operationId)
    }RequestBody`;

    requestBodyTypeLine = `requestBodyType: ${route.system}${
      capitalizeFirstLetter(method.operationId)
    }RequestBodyType,`;
  }

  if (method.requestBodyIsRawText) {
    requestBodyTypeParam = "{ rawText: string }";
  }

  let responseBodyTypeParam = "void";
  let responseBodyTypeLine = "";

  if (typeof method.responseBodyType === "string") {
    const rbtSys = getSystemFromTypeString(method.responseBodyType);
    const rbtType = getTypeFromTypeString(method.responseBodyType);
    responseBodyTypeParam = `${capitalizeFirstLetter(rbtSys)}${
      capitalizeFirstLetter(rbtType)
    }${method.responseBodyTypeArray ? "[]" : ""}`;

    responseBodyTypeLine = `responseBodyType: ${rbtSys}${
      capitalizeFirstLetter(rbtType)
    }${method.responseBodyTypeArray ? "Array" : ""}Type,`;
  }

  const responseSuccessCodeLine = method.responseSuccessCode
    ? `responseSuccessCode: ${method.responseSuccessCode},`
    : "";

  let markdownLine = "";

  // If using YAML, define the property as markdown: |-
  // Block scalar | retains the newlines as typed, which is fine because unwanted newlines will
  //   be removed when the markdown is rendered as html.
  // Block chomping - removes newlines from the end.
  if (method.markdown) {
    markdownLine = `markdown: "${
      method.markdown
        .replaceAll(/\"/g, '\\"')
        .replaceAll(/\n/g, "\\n")
    }",`;
  }

  const deprecatedLine = method.deprecated ? "deprecated: true," : "";

  // Build headers declaration.
  const headers = "[" + methodHeaders.map((h) => {
    const hSystem = getSystemFromTypeString(h.type);
    const hType = getTypeFromTypeString(h.type);
    const reqLine = h.isRequired ? "isRequired: true," : "";
    const depLine = h.deprecated ? `deprecated: "${h.deprecated}",` : "";
    const mwLine = h.fromMiddleware
      ? `fromMiddleware: "${h.fromMiddleware}",`
      : "";
    return `{
      name: "${h.name}",
      summary: "${h.summary}",
      ${reqLine}
      ${depLine}
      ${mwLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

  // Build url parameters declaration.
  const urlParams = "[" +
    (safeArray(route.urlParams)).map((urlResource) => {
      const uSystem = getSystemFromTypeString(urlResource.type);
      const uType = getTypeFromTypeString(urlResource.type);
      return `{
      name: "${urlResource.name}",
      summary: "${urlResource.summary}",
      type: ${uSystem}${capitalizeFirstLetter(uType)}Type,
    }`;
    }).join(", ") + "]";

  // Build query parameters declaration.
  const queryParams = "[" + (safeArray(methodQueryParams)).map((qp) => {
    const qpSystem = getSystemFromTypeString(qp.type);
    const qpType = getTypeFromTypeString(qp.type);
    const depLine = qp.deprecated ? `deprecated: "${qp.deprecated}",` : "";
    const mwLine = qp.fromMiddleware
      ? `fromMiddleware: "${qp.fromMiddleware}",`
      : "";
    return `{
      name: "${qp.name}",
      summary: "${qp.summary}",
      ${depLine}
      ${mwLine}
      type: ${qpSystem}${capitalizeFirstLetter(qpType)}Type,
    }`;
  }).join(", ") + "]";

  // Build outbound headers declaration.
  const outHeaders = "[" + methodOutHeaders.map((h) => {
    const hSystem = getSystemFromTypeString(h.type);
    const hType = getTypeFromTypeString(h.type);
    const gtdLine = h.isGuaranteed ? "isGuaranteed: true," : "";
    const depLine = h.deprecated ? `deprecated: "${h.deprecated}",` : "";
    const mwLine = h.fromMiddleware
      ? `fromMiddleware: "${h.fromMiddleware}",`
      : "";
    return `{
      name: "${h.name}",
      summary: "${h.summary}",
      ${gtdLine}
      ${depLine}
      ${mwLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

  // Build failure definitions declaration.
  let responseFailureDefsLine = "";
  if (methodFailureCodes.length > 0) {
    const rfcs = methodFailureCodes.map((rfc) => {
      const mwLine = rfc.fromMiddleware
        ? `fromMiddleware: "${rfc.fromMiddleware}",`
        : "";
      return `{
        code: ${rfc.code},
        type: "${rfc.type}",
        summary: "${rfc.summary}",
        ${mwLine}
      }`;
    }).join(", ");

    responseFailureDefsLine = `responseFailureDefinitions: [${rfcs}],`;
  }

  // Build a middleware declaration.
  const middleware = "[" +
    methodMiddleware.map((m) => `"${m}"`).join(", ") +
    "]";

  return {
    name: method.operationId,
    exported: true,
    outputGeneration: 2,
    typeName: `Operation<
      ${requestBodyTypeParam},
      ${responseBodyTypeParam},
      ${
      stringArrayToTypescriptUnion(
        safeArray(route.urlParams).map((p) => p.name),
      )
    },
      ${stringArrayToTypescriptUnion(methodHeaders.map((h) => h.name))},
      ${stringArrayToTypescriptUnion(methodQueryParams.map((qp) => qp.name))},
      ${stringArrayToTypescriptUnion(methodOutHeaders.map((h) => h.name))},
      ${stringArrayToTypescriptUnion(methodFailureCodes.map((f) => f.type))}
    >`,
    value: `{
      method: "${method.method}",
      name: "${method.name}",
      ${markdownLine}
      operationId: "${method.operationId}",
      middleware: ${middleware},
      urlPattern: "${route.urlPattern}",
      requestUrlParams: ${urlParams},
      requestHeaders: ${headers},
      requestQueryParams: ${queryParams},
      requestBodyIsRawText: ${method.requestBodyIsRawText ? "true" : "false"},
      ${requestBodyTypeLine}
      ${responseBodyTypeLine}
      responseHeaders: ${outHeaders},
      ${responseSuccessCodeLine}
      ${responseFailureDefsLine}
      apiVersion: "${method.apiVersion}",
      apiVersionIsOptional: ${method.apiVersionIsOptional ? "true" : "false"},
      ${deprecatedLine}
      tags: ${JSON.stringify(safeArray(route.tags))},
      flags: ${JSON.stringify(safeArray(method.flags))}
    }`,
  };
}
