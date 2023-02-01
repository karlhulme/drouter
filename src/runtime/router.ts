import {
  HttpError,
  Operation,
  OperationRequest,
  ServiceConfig,
  ServiceMiddleware,
} from "../interfaces/index.ts";
import {
  apiKeyHandlerNotDefinedResponse,
  apiKeyNotSuppliedResponse,
  apiKeyNotValidResponse,
  apiVersionNotSuppliedResponse,
  docsPageResponse,
  healthResponse,
  httpErrorResponse,
  internalServerErrorResponse,
  openApiResponse,
  resourceNotFoundResponse,
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
import { validateOperationPayload } from "./validateOperationPayload.ts";

/**
 * The name of the context value that will hold the operation payload
 * once it has been read.  It will be available to payloadMiddleware
 * functions.  Operations should use req.body instead which will be a
 * typed and validated value.
 */
export const CONTEXT_OPERATION_PAYLOAD = "operationPayload";

/**
 * The name of the context value that will hold the user associated
 * with the given API key.
 */
export const CONTEXT_OPERATION_API_KEY_USER = "operationApiKeyUser";

/**
 * The name of the context value that will hold the operation response body.
 * It will be available once the operation has run.
 */
export const CONTEXT_OPERATION_RESPONSE_BODY = "operationResponseBody";

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
  return async function (underlyingRequest: Request): Promise<Response> {
    let response: Response;

    try {
      response = await processRequest(
        underlyingRequest,
        config,
        internalOps,
        middlewareModules,
        loadPayloadIndex,
      );
    } catch (err) {
      if (err instanceof HttpError && err.code >= 400 && err.code < 500) {
        response = httpErrorResponse(err);
      } else {
        // Log the unexpected error to the console.
        console.log(err);
        // console.error(err);
        response = internalServerErrorResponse(underlyingRequest);
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
  underlyingRequest: Request,
  config: ServiceConfig,
  internalOps: InternalOp[],
  middlewareModules: ServiceMiddleware[],
  loadPayloadIndex: number,
) {
  const url = new URL(underlyingRequest.url);

  if (underlyingRequest.method === "OPTIONS") {
    return new Response();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/health") {
    return healthResponse();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/") {
    return rootResponse(config);
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/docs") {
    return docsPageResponse();
  }

  if (underlyingRequest.method === "GET" && url.pathname === "/openapi") {
    return openApiResponse(config);
  }

  const apiVersion = underlyingRequest.headers.get("api-version");

  if (!apiVersion) {
    return apiVersionNotSuppliedResponse();
  }

  const matchedOp = findMatchingOp(internalOps, underlyingRequest);

  if (!matchedOp) {
    return resourceNotFoundResponse();
  }

  const ctx = new Map<string, unknown>();

  if (matchedOp.operation.requiresApiKey) {
    if (!config.apiKeyHandler) {
      return apiKeyHandlerNotDefinedResponse();
    }

    const suppliedApiKey = underlyingRequest.headers.get("x-api-key");

    if (!suppliedApiKey) {
      return apiKeyNotSuppliedResponse();
    }

    const apiKeyUser = await config.apiKeyHandler(
      matchedOp.operation,
      suppliedApiKey,
    );

    if (!apiKeyUser) {
      return apiKeyNotValidResponse();
    }

    ctx.set(CONTEXT_OPERATION_API_KEY_USER, apiKeyUser);
  }

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
  ctx.set(CONTEXT_OPERATION_RESPONSE_BODY, null);

  let prevIndex = -1;
  let payload: unknown = null;

  const runner = async (
    index: number,
  ): Promise<Response> => {
    if (index === prevIndex) {
      throw new Error(
        "Middleware function called next() multiple times.",
      );
    }

    prevIndex = index;

    // Pull in the context before running any payload middleware functions.
    if (index === loadPayloadIndex && op.requestBodyType) {
      payload = await readJsonBody(underlyingRequest);
      ctx.set(CONTEXT_OPERATION_PAYLOAD, payload);
    }

    // Draw down the next middleware function.
    const middlewareMod = index < middlewareModules.length
      ? middlewareModules[index]
      : null;

    if (middlewareMod) {
      return await middlewareMod.process(underlyingRequest, ctx, op, () => {
        return runner(index + 1);
      });
    } else {
      // Create the request object which triggers validation of the
      // payload (body) and header/query/url parameters.
      const req = createOperationRequest(
        url,
        urlMatch,
        underlyingRequest,
        op,
        payload,
      );

      const res = await op.handler(req, ctx);

      const responseStatus = op.responseSuccessCode || 200;

      const responseHeaders = new Headers();

      for (const h of res.headers || []) {
        responseHeaders.append(
          h.name,
          convertToResponseHeaderValue(h.value),
        );
      }

      if (typeof res.body !== "undefined") {
        responseHeaders.append(
          "content-type",
          "application/json",
        );
      }

      const responseBody = typeof res.body === "undefined"
        ? null
        : JSON.stringify(res.body);

      if (typeof res.body !== "undefined") {
        ctx.set(CONTEXT_OPERATION_RESPONSE_BODY, res.body);
      }

      return new Response(responseBody, {
        headers: responseHeaders,
        status: responseStatus,
      });
    }
  };

  return await runner(0);
}

/**
 * Reads the JSON body from the request. If the body cannot be read
 * then a boolean value of false is returned, which will fail any
 * further validation.
 * @param underlyingRequest An HTTP request.
 */
export async function readJsonBody(
  underlyingRequest: Request,
): Promise<unknown> {
  try {
    return await underlyingRequest.json();
  } catch {
    // We use false here because it will fail validation
    // when the operation runs, allowing the request to
    // be tracked.
    return false;
  }
}

/**
 * Creates an OperationRequest object that can be passed to
 * an operation handler.  This process validates the inputs
 * against the data expected by the given operation.
 * @param url The full url that was requested.
 * @param urlMatch The url values.
 * @param underlyingRequest The underlying request.
 * @param op The operation that will handle the request.
 */
function createOperationRequest(
  url: URL,
  urlMatch: URLPatternResult,
  underlyingRequest: Request,
  op: Operation,
  payload: unknown,
): OperationRequest {
  validateOperationPayload(op, payload);

  const headerValues = getHeaderValues(underlyingRequest.headers, op);
  const queryParamValues = getQueryParamValues(url.searchParams, op);
  const urlParamValues = getUrlParamValues(
    urlMatch.pathname.groups,
    op,
  );

  return {
    path: url.pathname,
    urlPattern: op.urlPattern,
    method: op.method,
    cookies: getHttpCookieValues(underlyingRequest.headers.get("cookie")),
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
  };
}
