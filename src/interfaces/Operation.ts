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
 * The most type unconstrained version of the RESTful operation
 * whereby the request and response bodies can be any time
 * and the query, url and header names can be any string.
 */
export type GenericOperation = Operation<
  unknown,
  unknown,
  string,
  string,
  string,
  string
>;

/**
 * A RESTful operation.
 */
export interface Operation<
  RequestBodyType = never,
  ResponseBodyType = never,
  RequestUrlParamNames extends string = never,
  RequestHeaderNames extends string = never,
  RequestQueryParamNames extends string = never,
  ResponseHeaderNames extends string = never,
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
   * A set of flags that are typically used by middleware functions
   * to configure how they behave.
   */
  flags?: string[];

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
   * The implementation of any middleware asynchronous functions that can be
   * used to augment context and wrap/edit the response before it is sent
   * to the client.
   */
  middlewares?: ((
    req: OperationRequest<
      RequestBodyType,
      RequestUrlParamNames,
      RequestHeaderNames,
      RequestQueryParamNames
    >,
    ctx: OperationContext,
    next: () => Promise<
      OperationResponse<ResponseBodyType, ResponseHeaderNames>
    >,
  ) => Promise<OperationResponse<ResponseBodyType, ResponseHeaderNames>>)[];

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
