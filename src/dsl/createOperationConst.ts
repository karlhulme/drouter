// deno-lint-ignore-file no-explicit-any
import {
  capitalizeFirstLetter,
  getSystemFromTypeString,
  getTypeFromTypeString,
  TypescriptTreeConstDeclaration,
} from "../../deps.ts";
import { DslRoute, DslRouteMethod } from "./DslRoute.ts";
import { stringArrayToTypescriptUnion } from "./stringArrayToTypescriptUnion.ts";

export function createOperationConst(
  route: DslRoute,
  method: DslRouteMethod,
  allResources: any[],
): TypescriptTreeConstDeclaration {
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

  if (Array.isArray(method.responseFailureDefinitions)) {
    const rfcs = method.responseFailureDefinitions
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

  let apiKeyLine = "";

  if (method.requiresApiKey) {
    apiKeyLine = `requiresApiKey: true,`;
  }

  let cookieAuthLine = "";

  if (method.requiresCookieAuth) {
    cookieAuthLine = `requiresCookieAuth: true,`;
  }

  let deprecatedLine = "";

  if (method.deprecated) {
    deprecatedLine = `deprecated: true,`;
  }

  const urlParamNames = (route.urlParams || [])
    .map((urlp: any) => urlp.name);

  const headerNames = method.headerNames || [];

  if (method.acceptIdempotencyKey) {
    headerNames.push("idempotency-key");
  }

  if (method.usesUserAgent) {
    headerNames.push("user-agent");
  }

  // Build headers declaration.
  const headers = "[" + headerNames.map((h: any) => {
    const headerResource = allResources.find((r) =>
      r["$schema"] ===
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiHeader.json" &&
      r.name === h
    );
    if (!headerResource) {
      throw new Error(`Cannot find header ${h} on ${method.operationId}.`);
    }
    const hSystem = getSystemFromTypeString(headerResource.type);
    const hType = getTypeFromTypeString(headerResource.type);
    const reqLine = headerResource.isRequired ? "isRequired: true," : "";
    const depLine = headerResource.deprecated
      ? `deprecated: "${headerResource.deprecated}",`
      : "";
    return `{
      name: "${headerResource.name}",
      summary: "${headerResource.summary}",
      ${reqLine}
      ${depLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

  // Build url parameters declaration.
  const urlParams = "[" + (route.urlParams || []).map((urlResource: any) => {
    const uSystem = getSystemFromTypeString(urlResource.type);
    const uType = getTypeFromTypeString(urlResource.type);
    return `{
      name: "${urlResource.name}",
      summary: "${urlResource.summary}",
      type: ${uSystem}${capitalizeFirstLetter(uType)}Type,
    }`;
  }).join(", ") + "]";

  // Build query parameters declaration.
  const queryParams = "[" + (method.queryParams || []).map((qp: any) => {
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
  const responseHeaderNames = method.responseHeaderNames || [];

  if (method.usesSetCookie) {
    responseHeaderNames.push("set-cookie");
  }

  const outHeaders = "[" + responseHeaderNames.map((h: any) => {
    const outHeaderResource = allResources.find((r) =>
      r["$schema"] ===
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiOutboundHeader.json" &&
      r.name === h
    );
    if (!outHeaderResource) {
      throw new Error(`Cannot find out header ${h} on ${method.operationId}.`);
    }
    const hSystem = getSystemFromTypeString(outHeaderResource.type);
    const hType = getTypeFromTypeString(outHeaderResource.type);
    const gtdLine = outHeaderResource.isGuaranteed ? "isGuaranteed: true," : "";
    const depLine = outHeaderResource.deprecated
      ? `deprecated: "${outHeaderResource.deprecated}",`
      : "";
    return `{
      name: "${outHeaderResource.name}",
      summary: "${outHeaderResource.summary}",
      ${gtdLine}
      ${depLine}
      type: ${hSystem}${capitalizeFirstLetter(hType)}Type,
    }`;
  }).join(", ") + "]";

  // Get the names of the parameters.
  const queryParamNames = (method.queryParams || []).map((qp: any) => qp.name);

  // Get the local types of the failures.
  const failureTypeNames = (method.responseFailureDefinitions || []).map((
    rfd: any,
  ) => rfd.localType);

  return {
    name: method.operationId,
    exported: true,
    outputGeneration: 2,
    typeName: `Operation<
      ${requestBodyTypeParam},
      ${responseBodyTypeParam},
      ${stringArrayToTypescriptUnion(urlParamNames)},
      ${stringArrayToTypescriptUnion(headerNames)},
      ${stringArrayToTypescriptUnion(queryParamNames)},
      ${stringArrayToTypescriptUnion(responseHeaderNames)},
      ${stringArrayToTypescriptUnion(failureTypeNames)}
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
      ${apiKeyLine}
      ${cookieAuthLine}
      ${deprecatedLine}
      tags: ${JSON.stringify(route.tags || [])},
      flags: ${JSON.stringify(method.flags || [])}
    }`,
  };
}
