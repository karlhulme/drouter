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
   * The validated body of the request.
   */
  body: RequestBodyType;

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
