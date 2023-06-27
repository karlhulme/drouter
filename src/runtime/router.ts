import {
  HttpCookie,
  HttpError,
  Operation,
  OperationRequest,
  OperationRequestValue,
  ServiceConfig,
  ServiceMiddleware,
  ServiceMiddlewareRequest,
  ServiceMiddlewareResponse,
} from "../interfaces/index.ts";
import {
  apiVersionNotSuppliedResponse,
  docsPageRapidocCodeResponse,
  docsPageRapidocMapResponse,
  docsPageResponse,
  errorResponse,
  faviconResponse,
  healthResponse,
  openApiResponse,
  rootResponse,
} from "../responses/index.ts";
import { getHttpCookieValues, safeArray } from "../utils/index.ts";
import { getHeaderValues } from "./getHeaderValues.ts";
import { getQueryParamValues } from "./getQueryParamValues.ts";
import { getRequestValue } from "./getRequestValue.ts";
import { getUrlParamValues } from "./getUrlParamValues.ts";
import { convertToResponseHeaderValue } from "./convertToResponseHeaderValue.ts";
import { appendBuildVersionHeaders } from "./appendBuildVersionHeaders.ts";
import { appendCorsHeaders } from "./appendCorsHeaders.ts";
import { createHttpError } from "./createHttpError.ts";
import { OperationNamedType } from "../index.ts";

/**
 * An internal representation of an operation that includes
 * a compiled URL pattern for matching with requests.
 */
interface InternalOp {
  /**
   * A compiled url pattern.
   */
  urlPatternCompiled: URLPattern;

  /**
   * An operation defined in the config.
   */
  operation: Operation;
}

/**
 * Returns an HTTP request handler that picks operation implementations
 * based on the url and validates the request before invoking it.
 * @param config A router configuration that defines the operations
 * this service can provide.
 */
export function router(config: ServiceConfig): Deno.ServeHandler {
  // Concatenate the two types of middleware together
  // so that we can iterate thru all of them.
  const middlewareModules = [
    ...safeArray(config.middleware),
    ...safeArray(config.payloadMiddleware),
  ];

  // Determine the index at which the payload should be loaded.
  const loadPayloadIndex = safeArray(config.middleware).length;

  // Sort the ops such that the paths that require the
  // least number of parameters are matched first.
  const internalOps: InternalOp[] = config.operations
    .map((op) => ({
      urlPatternCompiled: new URLPattern({ pathname: op.urlPattern }),
      operation: op,
    }))
    .sort((a, b) =>
      safeArray(a.operation.requestUrlParams).length -
      safeArray(b.operation.requestUrlParams).length
    );

  // Return a function that can process individual requests.
  return async function (
    underlyingRequest: Request,
    _info: Deno.ServeHandlerInfo,
  ): Promise<Response> {
    const start = performance.now();
    let response: Response;
    const url = new URL(underlyingRequest.url);

    try {
      console.log(
        `${underlyingRequest.method} ${url.pathname}${url.search} (start)`,
      );

      response = await processRequest(
        url,
        underlyingRequest,
        config,
        internalOps,
        middlewareModules,
        loadPayloadIndex,
      );
    } catch (err) {
      // Log the error to the console.
      console.log(err);

      if (err instanceof HttpError) {
        response = errorResponse(
          err.code,
          err.type,
          err.title,
          err.detail,
          err.properties,
          err.additionalHeaders,
        );
      } else {
        response = errorResponse(
          500,
          "/err/internalServerError",
          "Unexpected error raised processing request.",
          undefined,
          {
            method: underlyingRequest.method,
            url: underlyingRequest.url,
          },
        );
      }
    } finally {
      // this prevents Deno.serve from crashing.
      if (!underlyingRequest.bodyUsed) {
        await underlyingRequest.text();
      }
    }

    // In all cases we append the CORs headers to the response.
    appendCorsHeaders(response.headers, config, underlyingRequest);

    // In all cases we append the version information to the response.
    appendBuildVersionHeaders(response.headers);

    // Log out the performance.
    const duration = performance.now() - start;
    console.log(
      `${underlyingRequest.method} ${url.pathname}${url.search} (${
        duration.toFixed(0)
      }ms) [${response.status}]`,
    );

    return response;
  };
}

/**
 * Process the given request and produce a response.
 * @param underlyingRequest The underlying HTTP request.
 * @param config The service configuration.
 * @param internalOps An array of operations sorted in order
 * of matching preference.
 */
async function processRequest(
  url: URL,
  underlyingRequest: Request,
  config: ServiceConfig,
  internalOps: InternalOp[],
  middlewareModules: ServiceMiddleware[],
  loadPayloadIndex: number,
) {
  if (underlyingRequest.method === "OPTIONS") {
    return new Response();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/health") {
    return healthResponse();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/") {
    return rootResponse(config);
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/favicon.ico") {
    return faviconResponse();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/docs") {
    return docsPageResponse(config, url);
  }

  if (
    underlyingRequest.method === "GET" && url.pathname === "/rapidoc-min.js"
  ) {
    return docsPageRapidocCodeResponse();
  }

  if (
    underlyingRequest.method === "GET" && url.pathname === "/rapidoc-min.js.map"
  ) {
    return docsPageRapidocMapResponse();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/openapi") {
    return openApiResponse(config, url);
  }

  const matchedOp = findMatchingOp(internalOps, underlyingRequest);

  if (!matchedOp) {
    return errorResponse(
      404,
      "/err/operationNotFound",
      "The requested operation was not found.",
    );
  }

  if (!matchedOp.operation.handler) {
    return errorResponse(
      501,
      "/err/operationNotImplemented",
      "The requested operation has not been implemented yet.",
    );
  }

  const apiVersion = underlyingRequest.headers.get("api-version");

  if (!apiVersion && !matchedOp.operation.apiVersionIsOptional) {
    return apiVersionNotSuppliedResponse();
  }

  const ctx = new Map<string, unknown>();

  return await executeMatchedOp(
    url,
    matchedOp.urlMatch,
    underlyingRequest,
    matchedOp.operation,
    ctx,
    middlewareModules,
    loadPayloadIndex,
  );
}

/**
 * Retturns the matching operation and the url match parameters
 * associated with it.  If a matching operation was not found then
 * null is returned.
 * @param internalOps An array of ops with compiled url matching regex.
 * @param underlyingRequest The underlying request object.
 */
function findMatchingOp(
  internalOps: { urlPatternCompiled: URLPattern; operation: Operation }[],
  underlyingRequest: Request,
) {
  for (const internalOp of internalOps) {
    if (internalOp.operation.method !== underlyingRequest.method) {
      continue;
    }

    const urlMatch = internalOp.urlPatternCompiled.exec(
      underlyingRequest.url,
    );

    if (urlMatch) {
      return {
        operation: internalOp.operation,
        urlMatch,
      };
    }
  }

  return null;
}

/**
 * Executes the given request using the given operation and
 * returns the response.
 * @param config The service configuration object.
 * @param url The full url that was requested.
 * @param urlMatch The url values.
 * @param underlyingRequest The underlying request.
 * @param op The operation that will handle the request.
 * @param middlewareModules An array of middleware processing
 * to occur before and after the operation handler.
 * @param loadPayloadIndex The index, within the middleware
 * modules, at which the payload should be loaded into context.
 */
async function executeMatchedOp(
  url: URL,
  urlMatch: URLPatternResult,
  underlyingRequest: Request,
  op: Operation,
  ctx: Map<string, unknown>,
  middlewareModules: ServiceMiddleware[],
  loadPayloadIndex: number,
) {
  // Parse and validate the header, query params and url param values.
  // If these aren't acceptable then no middleware handlers or operation
  // handler will be called.
  const headerValues = getHeaderValues(underlyingRequest.headers, op);
  const queryParamValues = getQueryParamValues(url.searchParams, op);
  const urlParamValues = getUrlParamValues(
    urlMatch.pathname.groups,
    op,
  );
  const cookies = getHttpCookieValues(underlyingRequest.headers.get("cookie"));

  let prevIndex = -1;
  let payload: unknown = null;

  const runner = async (
    index: number,
  ): Promise<ServiceMiddlewareResponse> => {
    if (index === prevIndex) {
      throw new Error(
        "Middleware function called next() multiple times.",
      );
    }

    prevIndex = index;

    // Determine if we're ready to run the middleware functions that
    // require the payload to have been loaded.
    if (index === loadPayloadIndex) {
      // If a request body type is specified then read, parse and
      // validate the JSON.
      // Otherwise, if the request body should be read as raw text
      // then do that now.
      if (op.requestBodyType) {
        payload = await readJsonBody(op.requestBodyType, underlyingRequest);
      } else if (op.requestBodyIsRawText) {
        payload = await readTextBody(underlyingRequest);
      }
    }

    // Draw down the next middleware function.
    const middlewareMod = index < middlewareModules.length
      ? middlewareModules[index]
      : null;

    // Determine if the operation needs this middleware.
    const isMiddlewareApplied = Boolean(
      op.middleware &&
        op.middleware.find((m) => m === middlewareMod?.name),
    );

    if (middlewareMod) {
      if (isMiddlewareApplied && middlewareMod.handler) {
        const mwreq = createMiddlewareRequest(
          url,
          underlyingRequest,
          op,
          payload,
          headerValues,
          queryParamValues,
          cookies,
        );

        return await middlewareMod.handler(
          mwreq,
          ctx,
          op,
          () => {
            return runner(index + 1);
          },
        );
      } else {
        // This middleware is not required or not implemented so
        // we proceed to the next middleware module.
        return runner(index + 1);
      }
    } else {
      // Create the request object which triggers validation of the
      // payload (body) and header/query/url parameters.
      const req = createOperationRequest(
        url,
        underlyingRequest,
        op,
        payload,
        headerValues,
        queryParamValues,
        urlParamValues,
        cookies,
      );

      const res = await op.handler!(req, ctx);

      return {
        body: res.body,
        headers: res.headers,
      };
    }
  };

  const grandResult = await runner(0);

  const responseStatus = op.responseSuccessCode || 200;

  const responseHeaders = new Headers();

  for (const h of grandResult.headers || []) {
    responseHeaders.append(
      h.name,
      convertToResponseHeaderValue(h.value),
    );
  }

  if (typeof grandResult.body !== "undefined") {
    responseHeaders.append(
      "content-type",
      "application/json",
    );
  }

  const responseBody = typeof grandResult.body === "undefined"
    ? null
    : JSON.stringify(grandResult.body);

  return new Response(responseBody, {
    headers: responseHeaders,
    status: responseStatus,
  });
}

/**
 * Reads the JSON body from the request and validates it.
 * @param underlyingRequest An HTTP request.
 */
export async function readJsonBody(
  requestBodyType: OperationNamedType,
  underlyingRequest: Request,
): Promise<unknown> {
  let payload;
  let validationResult;

  try {
    payload = await underlyingRequest.json();

    validationResult = requestBodyType.validator(
      payload,
      "requestBody",
    );
  } catch (err) {
    throw new HttpError(
      400,
      "/err/requestBodyJsonDidNotValidate",
      "The request body JSON failed validation.",
      err.message,
    );
  }

  if (Array.isArray(validationResult) && validationResult.length > 0) {
    throw new HttpError(
      400,
      "/err/requestBodyJsonDidNotValidate",
      "The request body JSON failed validation.",
      undefined,
      {
        validationResult,
      },
    );
  }

  return payload;
}

/**
 * Reads the body from the request.
 * @param underlyingRequest An HTTP request.
 */
export async function readTextBody(
  underlyingRequest: Request,
): Promise<unknown> {
  console.log("IS THIS EVEN BEING CALLED");
  return {
    rawText: await underlyingRequest.text(),
  };
}

/**
 * Creates a MiddlewareRequest object that can be passed to
 * a middleware handler.  This process validates the inputs
 * against the data expected by the given operation.
 * @param url The full url that was requested.
 * @param underlyingRequest The underlying request.
 * @param op The operation that will handle the request.
 */
function createMiddlewareRequest(
  url: URL,
  underlyingRequest: Request,
  op: Operation,
  payload: unknown,
  headerValues: OperationRequestValue[],
  queryParamValues: OperationRequestValue[],
  cookies: HttpCookie[],
): ServiceMiddlewareRequest {
  return {
    path: url.pathname,
    urlPattern: op.urlPattern,
    method: op.method,
    cookies,
    body: payload,
    headers: {
      getAllValues: () => headerValues,
      getOptionalString: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "string",
          false,
        ) as string | null,
      getRequiredString: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "string",
          true,
        ) as string,
      getOptionalNumber: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "number",
          false,
        ) as number | null,
      getRequiredNumber: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "number",
          true,
        ) as number,
      getOptionalBoolean: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "boolean",
          false,
        ) as boolean | null,
      getRequiredBoolean: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "boolean",
          true,
        ) as boolean,
      getOptionalObject: <T>(headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "object",
          false,
        ) as T | null,
      getRequiredObject: <T>(headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "object",
          true,
        ) as T,
    },
    queryParams: {
      getAllValues: () => queryParamValues,
      getOptionalString: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "string",
          false,
        ) as string | null,
      getRequiredString: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "string",
          true,
        ) as string,
      getOptionalNumber: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "number",
          false,
        ) as number | null,
      getRequiredNumber: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "number",
          true,
        ) as number,
      getOptionalBoolean: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "boolean",
          false,
        ) as boolean | null,
      getRequiredBoolean: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "boolean",
          true,
        ) as boolean,
      getOptionalObject: <T>(queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "object",
          false,
        ) as T | null,
      getRequiredObject: <T>(queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "object",
          true,
        ) as T,
    },
    underlyingRequest,
    error: (type, detail, properties, additionalHeaders) =>
      createHttpError(op, type, detail, properties, additionalHeaders),
    start: new Date(),
  };
}

/**
 * Creates an OperationRequest object that can be passed to
 * an operation handler.  This process validates the inputs
 * against the data expected by the given operation.
 * @param url The full url that was requested.
 * @param underlyingRequest The underlying request.
 * @param op The operation that will handle the request.
 */
function createOperationRequest(
  url: URL,
  underlyingRequest: Request,
  op: Operation,
  payload: unknown,
  headerValues: OperationRequestValue[],
  queryParamValues: OperationRequestValue[],
  urlParamValues: OperationRequestValue[],
  cookies: HttpCookie[],
): OperationRequest {
  return {
    path: url.pathname,
    urlPattern: op.urlPattern,
    method: op.method,
    cookies,
    body: payload,
    headers: {
      getAllValues: () => headerValues,
      getOptionalString: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "string",
          false,
        ) as string | null,
      getRequiredString: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "string",
          true,
        ) as string,
      getOptionalNumber: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "number",
          false,
        ) as number | null,
      getRequiredNumber: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "number",
          true,
        ) as number,
      getOptionalBoolean: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "boolean",
          false,
        ) as boolean | null,
      getRequiredBoolean: (headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "boolean",
          true,
        ) as boolean,
      getOptionalObject: <T>(headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "object",
          false,
        ) as T | null,
      getRequiredObject: <T>(headerName: string) =>
        getRequestValue(
          op,
          `Header '${headerName}'`,
          headerName.toLowerCase(),
          headerValues,
          "object",
          true,
        ) as T,
    },
    queryParams: {
      getAllValues: () => queryParamValues,
      getOptionalString: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "string",
          false,
        ) as string | null,
      getRequiredString: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "string",
          true,
        ) as string,
      getOptionalNumber: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "number",
          false,
        ) as number | null,
      getRequiredNumber: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "number",
          true,
        ) as number,
      getOptionalBoolean: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "boolean",
          false,
        ) as boolean | null,
      getRequiredBoolean: (queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "boolean",
          true,
        ) as boolean,
      getOptionalObject: <T>(queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "object",
          false,
        ) as T | null,
      getRequiredObject: <T>(queryParamName: string) =>
        getRequestValue(
          op,
          `Query param '${queryParamName}'`,
          queryParamName,
          queryParamValues,
          "object",
          true,
        ) as T,
    },
    urlParams: {
      getAllValues: () => urlParamValues,
      getRequiredString: (urlParamName: string) =>
        getRequestValue(
          op,
          `Url param '${urlParamName}'`,
          urlParamName,
          urlParamValues,
          "string",
          true,
        ) as string,
      getRequiredNumber: (urlParamName: string) =>
        getRequestValue(
          op,
          `Url param '${urlParamName}'`,
          urlParamName,
          urlParamValues,
          "number",
          true,
        ) as number,
      getRequiredBoolean: (urlParamName: string) =>
        getRequestValue(
          op,
          `Url param '${urlParamName}'`,
          urlParamName,
          urlParamValues,
          "boolean",
          true,
        ) as boolean,
    },
    underlyingRequest,
    error: (type, detail, properties, additionalHeaders) =>
      createHttpError(op, type, detail, properties, additionalHeaders),
    start: new Date(),
  };
}
