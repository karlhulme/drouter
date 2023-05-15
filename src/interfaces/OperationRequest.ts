import { HttpCookie } from "./HttpCookie.ts";
import { OperationRequestHeadersBlock } from "./OperationRequestHeadersBlock.ts";
import { OperationRequestQueryParamsBlock } from "./OperationRequestQueryParamsBlock.ts";
import { OperationRequestUrlParamsBlock } from "./OperationRequestUrlParamsBlock.ts";

/**
 * The data for an operation request.
 */
export interface OperationRequest<
  RequestBodyType = unknown,
  RequestUrlParamNames extends string = string,
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
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
   * The validated body of the request.
   */
  body: RequestBodyType;

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
   * The validated url parameter values passed with the request.
   */
  urlParams: OperationRequestUrlParamsBlock<RequestUrlParamNames>;

  /**
   * The point that request processing began.
   */
  start: Date;
}
