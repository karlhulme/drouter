import { OperationFailureDefinition } from "./OperationFailureDefinition.ts";
import { OperationQueryParam } from "./OperationQueryParam.ts";
import { OperationRequest } from "./OperationRequest.ts";
import { OperationHeader } from "./OperationHeader.ts";
import { OperationResponse } from "./OperationResponse.ts";
import { OperationHeaderOutbound } from "./OperationHeaderOutbound.ts";
import { OperationUrlParam } from "./OperationUrlParam.ts";
import { OperationNamedType } from "./OperationNamedType.ts";

export type GenericOperation = Operation<
  // deno-lint-ignore no-explicit-any
  any,
  // deno-lint-ignore no-explicit-any
  any,
  string,
  string,
  string,
  string
>;

export interface Operation<
  RequestBodyType = undefined,
  ResponseBodyType = undefined,
  RequestUrlParamNames extends string = string,
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
  ResponseHeaderNames extends string = string,
> {
  urlPattern: string;
  name: string;
  operationId: string;
  summary?: string;
  tags: string[];
  deprecated?: boolean;
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  requestUrlParams?: OperationUrlParam<RequestUrlParamNames>[];
  requestHeaders?: OperationHeader<RequestHeaderNames>[];
  requestQueryParams?: OperationQueryParam<RequestQueryParamNames>[];
  requestBodyType?: OperationNamedType;
  responseBodyType?: OperationNamedType;
  responseHeaders?: OperationHeaderOutbound<ResponseHeaderNames>[];
  responseSuccessCode?: number;
  responseFailureDefinitions?: OperationFailureDefinition[];
  handler: (
    req: OperationRequest<
      RequestBodyType,
      RequestUrlParamNames,
      RequestHeaderNames,
      RequestQueryParamNames
    >,
  ) => Promise<OperationResponse<ResponseBodyType, ResponseHeaderNames>>;
}
