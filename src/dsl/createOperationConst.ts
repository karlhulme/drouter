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

  if (!method.headers) {
    method.headers = [];
  }

  const urlParamNames = (route.urlParams || [])
    .map((urlp: any) => urlp.name);

  if (method.acceptIdempotencyKey) {
    method.headers.push({
      name: "idempotency-key",
      summary:
        "Specify a unique value to ensure the operation is only executed once.",
      type: "std/uuid",
    });
  }

  if (method.usesUserAgent) {
    method.headers.push({
      name: "user-agent",
      summary:
        "A description of the client that made the request.  Browsers and fetchers will generate this string automatically.",
      type: "std/maxString",
    });
  }

  // Build headers declaration.
  const headers = "[" + method.headers.map((h: any) => {
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
  if (!method.responseHeaders) {
    method.responseHeaders = [];
  }

  if (method.usesSetCookie) {
    method.headers.push({
      name: "set-cookie",
      summary: "An instruction to the browser to record a value in a cookie.",
      type: "std/maxString",
    });
  }

  const outHeaders = "[" + method.responseHeaders.map((h: any) => {
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
      ${stringArrayToTypescriptUnion(method.headers.map((h) => h.name))},
      ${stringArrayToTypescriptUnion(queryParamNames)},
      ${
      stringArrayToTypescriptUnion(method.responseHeaders.map((h) => h.name))
    },
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
