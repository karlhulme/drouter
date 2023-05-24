import { ServiceMiddlewareResponseHeader } from "./ServiceMiddlewareResponseHeader.ts";

/**
 * Te response from a middleware handler.
 */
export interface ServiceMiddlewareResponse<
  ResponseHeaderNames extends string = string,
> {
  /**
   * The body of the response.
   */
  body?: unknown;

  /**
   * An array of response headers.
   */
  headers?: ServiceMiddlewareResponseHeader<ResponseHeaderNames>[];
}
