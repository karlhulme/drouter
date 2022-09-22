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

          const resp = await op.handler({
            body,
            headers: {
              getOptionalString: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "string",
                  false,
                ) as string | null,
              getRequiredString: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "string",
                  true,
                ) as string,
              getOptionalNumber: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "number",
                  false,
                ) as number | null,
              getRequiredNumber: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "number",
                  true,
                ) as number,
              getOptionalBoolean: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "boolean",
                  false,
                ) as boolean | null,
              getRequiredBoolean: (headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "boolean",
                  true,
                ) as boolean,
              getOptionalObject: <T>(headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "object",
                  false,
                ) as T | null,
              getRequiredObject: <T>(headerName: string) =>
                getRequestValue(
                  op,
                  `Header '${headerName}'`,
                  headerName,
                  headerValues,
                  "object",
                  true,
                ) as T,
            },
            queryParams: {
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
          });

          const respHeaders = (resp.headers || []).reduce((agg, cur) => {
            agg[cur.name] = cur.value;

            return agg;
          }, {} as Record<string, unknown>);

          const resultStatus = op.responseSuccessCode || 200;

          if (typeof resp.body === "undefined") {
            return new Response(null, {
              status: resultStatus,
            });
          } else {
            return new Response(JSON.stringify(resp.body), {
              headers: {
                "content-type": "application/json",
                ...respHeaders,
              },
              status: resultStatus,
            });
          }
        }
      }

      return createErrorResponse(
        new OperationError(404, "Resource not found."),
      );
    } catch (err) {
      if (err instanceof OperationError) {
        return createErrorResponse(err);
      } else {
        // Logs the unexpected error to the console.
        console.error(err);

        return createErrorResponse(
          new OperationError(500, "Internal server error."),
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
