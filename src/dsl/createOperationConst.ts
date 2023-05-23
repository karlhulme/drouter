// deno-lint-ignore-file no-explicit-any
import {
  capitalizeFirstLetter,
  getSystemFromTypeString,
  getTypeFromTypeString,
  TypescriptTreeConstDeclaration,
} from "../../deps.ts";
import { safeArray } from "../utils/index.ts";
import { DslMiddleware } from "./DslMiddleware.ts";
import { DslRoute, DslRouteMethod } from "./DslRoute.ts";
import { stringArrayToTypescriptUnion } from "./stringArrayToTypescriptUnion.ts";

export function createOperationConst(
  route: DslRoute,
  method: DslRouteMethod,
  mwares: DslMiddleware[],
): TypescriptTreeConstDeclaration {
  // Combine the headers, query params and failure codes
  // from the route and the associated middlewares.
  const methodHeaders = mwares.map((m) => safeArray(m.headers))
    .flat()
    .concat(safeArray(method.headers))
    .concat({
      name: "api-version",
      summary: "The version targeted by the request.",
      type: "std/date",
    });
  const methodQueryParams = mwares.map((m) => safeArray(m.queryParams))
    .flat()
    .concat(safeArray(method.queryParams));
  const methodOutHeaders = mwares.map((m) => safeArray(m.responseHeaders))
    .flat()
    .concat(safeArray(method.responseHeaders));
  const methodFailureCodes = mwares.map((m) =>
    safeArray(m.responseFailureDefinitions)
  )
    .flat()
    .concat(safeArray(method.responseFailureDefinitions))
    .concat({
      code: 500,
      localType: "internalServerError",
      summary: "Unexpected error raised while processing request.",
    });

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

  let responseFailureDefsLine = "";

  if (methodFailureCodes.length > 0) {
    const rfcs = methodFailureCodes
      .map((rfc: any) => `
        {
          code: ${rfc.code},
          localType: "${rfc.localType}",
          summary: "${rfc.summary}"
        }`)
      .join(", ");

    responseFailureDefsLine = `responseFailureDefinitions: [${rfcs}],`;
  }

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
  const headers = "[" + methodHeaders.map((h: any) => {
    const hSystem = getSystemFromTypeString(h.type);
    const hType = getTypeFromTypeString(h.type);
    const reqLine = h.isRequired ? "isRequired: true," : "";
    const depLine = h.deprecated ? `deprecated: "${h.deprecated}",` : "";
    return `{
      name: "${h.name}",
      summary: "${h.summary}",
      ${reqLine}
      ${depLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

  // Build url parameters declaration.
  const urlParams = "[" +
    (safeArray(route.urlParams)).map((urlResource: any) => {
      const uSystem = getSystemFromTypeString(urlResource.type);
      const uType = getTypeFromTypeString(urlResource.type);
      return `{
      name: "${urlResource.name}",
      summary: "${urlResource.summary}",
      type: ${uSystem}${capitalizeFirstLetter(uType)}Type,
    }`;
    }).join(", ") + "]";

  // Build query parameters declaration.
  const queryParams = "[" + (safeArray(methodQueryParams)).map((qp: any) => {
    const qpSystem = getSystemFromTypeString(qp.type);
    const qpType = getTypeFromTypeString(qp.type);
    const depLine = qp.deprecated ? `deprecated: "${qp.deprecated}",` : "";
    return `{
      name: "${qp.name}",
      summary: "${qp.summary}",
      ${depLine}
      type: ${qpSystem}${capitalizeFirstLetter(qpType)}Type,
    }`;
  }).join(", ") + "]";

  // Build outbound headers declaration.
  const outHeaders = "[" + methodOutHeaders.map((h: any) => {
    const hSystem = getSystemFromTypeString(h.type);
    const hType = getTypeFromTypeString(h.type);
    const gtdLine = h.isGuaranteed ? "isGuaranteed: true," : "";
    const depLine = h.deprecated ? `deprecated: "${h.deprecated}",` : "";
    return `{
      name: "${h.name}",
      summary: "${h.summary}",
      ${gtdLine}
      ${depLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

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
      ${
      stringArrayToTypescriptUnion(methodFailureCodes.map((f) => f.localType))
    }
    >`,
    value: `{
      method: "${method.method}",
      name: "${method.name}",
      ${markdownLine}
      operationId: "${method.operationId}",
      urlPattern: "${route.urlPattern}",
      requestUrlParams: ${urlParams},
      requestHeaders: ${headers},
      requestQueryParams: ${queryParams},
      ${requestBodyTypeLine}
      ${responseBodyTypeLine}
      responseHeaders: ${outHeaders},
      ${responseSuccessCodeLine}
      ${responseFailureDefsLine}
      apiVersion: "${method.apiVersion}",
      ${deprecatedLine}
      tags: ${JSON.stringify(safeArray(route.tags))},
      flags: ${JSON.stringify(safeArray(method.flags))}
    }`,
  };
}
