import { OperationCookie } from "./OperationCookie.ts";
import { OperationRequestHeadersBlock } from "./OperationRequestHeadersBlock.ts";
import { OperationRequestQueryParamsBlock } from "./OperationRequestQueryParamsBlock.ts";
import { OperationRequestUrlParamsBlock } from "./OperationRequestUrlParamsBlock.ts";

/**
 * The data for an operation request.
 */
export interface OperationRequest<
  RequestBodyType,
  RequestUrlParamNames extends string,
  RequestHeaderNames extends string,
  RequestQueryParamNames extends string,
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
   * The array of cookies passed into the request.
   */
  cookies: OperationCookie[];

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
}
