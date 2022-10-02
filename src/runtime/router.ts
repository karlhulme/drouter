import { OperationError, ServiceConfig } from "../interfaces/index.ts";
import { getJsonBody } from "./getJsonBody.ts";
import { getHeaderValues } from "./getHeaderValues.ts";
import { getQueryParamValues } from "./getQueryParamValues.ts";
import { getRequestValue } from "./getRequestValue.ts";
import { getUrlParamValues } from "./getUrlParamValues.ts";
import { docsPageResponse } from "./docsPageResponse.ts";
import { createErrorResponse } from "./createErrorResponse.ts";
import { healthResponse } from "./healthResponse.ts";
import { rootResponse } from "./rootResponse.ts";
import { openApiResponse } from "./openApiResponse.ts";
import { convertToResponseHeaderValue } from "./convertToResponseHeaderValue.ts";

/**
 * Returns an HTTP request handler that picks operation implementations
 * based on the url and validates the request before invoking it.
 * @param config A router configuration that defines the operations
 * this service can provide.
 */
export function router(config: ServiceConfig): Deno.ServeHandler {
  const internalOps = config.operations.map((op) => ({
    urlPatternCompiled: new URLPattern({ pathname: op.urlPattern }),
    operation: op,
  }));

  return async function (req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);

      if (req.method === "GET" && url.pathname === "/") {
        return rootResponse(config);
      }

      if (req.method === "GET" && url.pathname === "/health") {
        return healthResponse();
      }

      if (req.method === "GET" && url.pathname === "/docs") {
        return docsPageResponse();
      }

      if (req.method === "GET" && url.pathname === "/openapi") {
        return openApiResponse(config);
      }

      for (const internalOp of internalOps) {
        if (internalOp.operation.method !== req.method) {
          continue;
        }

        const urlMatch = internalOp.urlPatternCompiled.exec(req.url);

        if (urlMatch) {
          const op = internalOp.operation;

          const body = await getJsonBody(req, op);

          const headerValues = getHeaderValues(req.headers, op);
          const queryParamValues = getQueryParamValues(url.searchParams, op);
          const urlParamValues = getUrlParamValues(
            urlMatch.pathname.groups,
            op,
          );

          const ctx = new Map();

          if (Array.isArray(config.preProcessors)) {
            for (const preProcessor of config.preProcessors) {
              await preProcessor(req, ctx);
            }
          }

          const resp = await op.handler({
            path: url.pathname,
            urlPattern: internalOp.operation.urlPattern,
            method: internalOp.operation.method,
            body,
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
            underlyingRequest: req,
          }, ctx);

          const responseStatus = op.responseSuccessCode || 200;

          const responseHeaders = new Headers({
            "content-type": "application/json",
          });

          for (const h of resp.headers || []) {
            responseHeaders.append(
              h.name,
              convertToResponseHeaderValue(h.value),
            );
          }

          const responseBody = typeof resp.body === "undefined"
            ? null
            : JSON.stringify(resp.body);

          return new Response(responseBody, {
            headers: responseHeaders,
            status: responseStatus,
          });
        }
      }

      return createErrorResponse(
        new OperationError(404, "RESOURCE_NOT_FOUND", "Resource not found."),
      );
    } catch (err) {
      if (err instanceof OperationError) {
        return createErrorResponse(err);
      } else {
        // Logs the unexpected error to the console.
        console.error(err);

        return createErrorResponse(
          new OperationError(
            500,
            "INTERNAL_SERVER_ERROR",
            "Internal server error.",
          ),
        );
      }
    } finally {
      // this prevents Deno.serve from crashing.
      if (!req.bodyUsed) {
        await req.text();
      }
    }
  };
}
