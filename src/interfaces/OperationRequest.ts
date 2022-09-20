import { OperationRequestHeadersBlock } from "./OperationRequestHeadersBlock.ts";
import { OperationRequestQueryParamsBlock } from "./OperationRequestQueryParamsBlock.ts";
import { OperationRequestUrlParamsBlock } from "./OperationRequestUrlParamsBlock.ts";

export interface OperationRequest<
  RequestBodyType,
  RequestUrlParamNames extends string,
  RequestHeaderNames extends string,
  RequestQueryParamNames extends string,
> {
  body: RequestBodyType;
  headers: OperationRequestHeadersBlock<RequestHeaderNames>;
  queryParams: OperationRequestQueryParamsBlock<RequestQueryParamNames>;
  underlyingRequest: Request;
  urlParams: OperationRequestUrlParamsBlock<RequestUrlParamNames>;
}
