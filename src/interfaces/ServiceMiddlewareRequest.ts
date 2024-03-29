import { HttpCookie } from "./HttpCookie.ts";
import { HttpError } from "./HttpError.ts";
import { OperationRequestHeadersBlock } from "./OperationRequestHeadersBlock.ts";
import { OperationRequestQueryParamsBlock } from "./OperationRequestQueryParamsBlock.ts";

/**
 * The data for a middleware request.
 */
export interface ServiceMiddlewareRequest<
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
  ResponseHeaderNames extends string = string,
  RequestFailureTypes extends string = string,
> {
  /**
   * The relative path of the request.
   */
  path: string;

  /**
   * The relative url pattern that matched the request.
   */
  urlPattern: string;

  /**
   * The method of the request.
   */
  method: string;

  /**
   * The validated body of the request.  This value will be null if
   * the middleware is executed before the payload is read from the request.
   */
  body: unknown;

  /**
   * An array of HTTP cookies passed with the request.
   */
  cookies: HttpCookie[];

  /**
   * The validated headers values passed with the request.
   */
  headers: OperationRequestHeadersBlock<RequestHeaderNames>;

  /**
   * The validated query parameter values passed with the request.
   */
  queryParams: OperationRequestQueryParamsBlock<RequestQueryParamNames>;

  /**
   * The underlying request object handled by Deno.
   */
  underlyingRequest: Request;

  /**
   * Constructs an HttpError that can be thrown, based on one
   * of the recognised failure codes.
   * @param type The full type name of the failure.
   * @param detail A description of the error, personalised for this
   * specific instance.
   * @param properties A record of any additional properties that
   * might be useful to the client in handling the error.
   * @param additionalHeaders A record of any additional headers
   * to be added to the error response.
   */
  error: (
    type: RequestFailureTypes,
    detail?: string,
    properties?: Record<string, unknown>,
    additionalHeaders?: Record<ResponseHeaderNames, string>,
  ) => HttpError;

  /**
   * The point that request processing began.
   */
  start: Date;
}
