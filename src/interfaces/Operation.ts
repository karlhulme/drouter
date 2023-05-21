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
 * A RESTful operation.  If type parameters are not supplied
 * then the most unconstrained version of the type is used.
 * That means the request and response bodies can be any
 * type and the query, url and header names can be any string.
 *
 * The RequestBodyType and ResponseBodyType need to be the
 * Typescript 'any' type.  Attempts to use the unknown type causes
 * breaking issues when trying to assign Operation<specific...>
 * to Operation<unknown...> which is necessary when setting up
 * the router.
 */
export interface Operation<
  // deno-lint-ignore no-explicit-any
  RequestBodyType = any,
  // deno-lint-ignore no-explicit-any
  ResponseBodyType = any,
  RequestUrlParamNames extends string = string,
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
  ResponseHeaderNames extends string = string,
  RequestFailureCodes extends string = string,
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
   * A summary of the operation's behaviour in markdown.
   * This may include markdown.
   */
  markdown?: string;

  /**
   * An array of strings that are used to group operations together in
   * the documentation.
   */
  tags: string[];

  /**
   * An array of string that are used by the middleware functions to
   * determine their applicability and behaviour.
   */
  flags: string[];

  /**
   * A description of the approach to take given that this operation is deprecated.
   */
  deprecated?: string;

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
   * The first api version where this operation is available.
   * This should be in the format YYYY-MM-DD.
   */
  apiVersion: string;

  /**
   * The implementation of the operation as an asynchronous function.
   */
  handler?: (
    req: OperationRequest<
      RequestBodyType,
      RequestUrlParamNames,
      RequestHeaderNames,
      RequestQueryParamNames,
      RequestFailureCodes
    >,
    ctx: OperationContext,
  ) => Promise<OperationResponse<ResponseBodyType, ResponseHeaderNames>>;

  // apiVersionRequestHandler?: (payload: unknown, reqApiVersion: string) => unknown
  // apiVersionResponseHandler?: (payload: unknown, resApiVersion: string) => unknown

  /**
   * True if the operation requires an x-api-key header to be supplied.
   */
  requiresApiKey?: boolean;

  /**
   * True if the operation requires a cookie to be supplied for authentication.
   */
  requiresCookieAuth?: boolean;
}
