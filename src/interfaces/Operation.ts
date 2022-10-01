import { OperationFailureDefinition } from "./OperationFailureDefinition.ts";
import { OperationQueryParam } from "./OperationQueryParam.ts";
import { OperationRequest } from "./OperationRequest.ts";
import { OperationHeader } from "./OperationHeader.ts";
import { OperationResponse } from "./OperationResponse.ts";
import { OperationHeaderOutbound } from "./OperationHeaderOutbound.ts";
import { OperationUrlParam } from "./OperationUrlParam.ts";
import { OperationNamedType } from "./OperationNamedType.ts";
import { OperationContext } from "./OperationContext.ts";

/**
 * A RESTful operation without any type constraints.
 */
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

/**
 * A RESTful operation.
 */
export interface Operation<
  RequestBodyType = undefined,
  ResponseBodyType = undefined,
  RequestUrlParamNames extends string = string,
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
  ResponseHeaderNames extends string = string,
> {
  /**
   * The url to match including any url parameters, e.g /users/:id
   */
  urlPattern: string;

  /**
   * The name of the operation as it will appear in documentation.
   */
  name: string;

  /**
   * The id of the operation as it will appear in client generated code.
   */
  operationId: string;

  /**
   * A summary of the operation's behaviour.
   */
  summary?: string;

  /**
   * An array of tags as used by the documentation generation.
   */
  tags: string[];

  /**
   * True if the operation should not be used on new projects.
   */
  deprecated?: boolean;

  /**
   * The HTTP method.
   */
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

  /**
   * An array of url parameters required by the operation.
   */
  requestUrlParams?: OperationUrlParam<RequestUrlParamNames>[];

  /**
   * An array of headers that the operation requires or supports.
   */
  requestHeaders?: OperationHeader<RequestHeaderNames>[];

  /**
   * An array of query parameters that the operation requires or supports.
   */
  requestQueryParams?: OperationQueryParam<RequestQueryParamNames>[];

  /**
   * The type of the request body.
   */
  requestBodyType?: OperationNamedType;

  /**
   * The type of the response.
   */
  responseBodyType?: OperationNamedType;

  /**
   * An array of headers that the operation returns.
   */
  responseHeaders?: OperationHeaderOutbound<ResponseHeaderNames>[];

  /**
   * The code returned from a successful invocation.
   */
  responseSuccessCode?: number;

  /**
   * An array of failure definitions.
   */
  responseFailureDefinitions?: OperationFailureDefinition[];

  /**
   * The implementation of the operation as an asynchronous function.
   */
  handler: (
    req: OperationRequest<
      RequestBodyType,
      RequestUrlParamNames,
      RequestHeaderNames,
      RequestQueryParamNames
    >,
    ctx: OperationContext,
  ) => Promise<OperationResponse<ResponseBodyType, ResponseHeaderNames>>;
}
