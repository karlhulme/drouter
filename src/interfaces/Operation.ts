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
   * The implementation of any middleware asynchronous functions that can be
   * used to augment context and wrap/edit the response before it is sent
   * to the client.  The middleware is typed with the most permissive
   * types (similar to GenericOperation) since the middleware cannot know
   * anything about which operation they will be operating on.
   */
  middlewares?: ((
    req: OperationRequest,
    ctx: OperationContext,
    next: () => Promise<OperationResponse>,
  ) => Promise<OperationResponse>)[];

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
