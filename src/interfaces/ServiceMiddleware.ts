import { Operation } from "./Operation.ts";
import { OperationContext } from "./OperationContext.ts";
import { ServiceMiddlewareFailureDefinition } from "./ServiceMiddlewareFailureDefinition.ts";
import { ServiceMiddlewareHeader } from "./ServiceMiddlewareHeader.ts";
import { ServiceMiddlewareOutboundHeader } from "./ServiceMiddlewareOutboundHeader.ts";
import { ServiceMiddlewareQueryParam } from "./ServiceMiddlewareQueryParam.ts";
import { ServiceMiddlewareRequest } from "./ServiceMiddlewareRequest.ts";
import { ServiceMiddlewareResponse } from "./ServiceMiddlewareResponse.ts";

/**
 * A middleware module that can defines processing and handling
 * that is shared by multiple operations.
 */
export interface ServiceMiddleware<
  RequestBody = unknown,
  RequestHeaderNames extends string = string,
  RequestQueryParamNames extends string = string,
  ResponseHeaderNames extends string = string,
  RequestFailureTypes extends string = string,
> {
  /**
   * The name of a middleware module.
   */
  name: string;

  /**
   * An array of the header names that the middleware will process.
   * This definition is not used at run-time, because the headers are
   * defined on the operation.
   */
  headers?: ServiceMiddlewareHeader<RequestHeaderNames>[];

  /**
   * An array of query parameter names that the middleware will process.
   * This definition is not used at run-time, because the query params are
   * defined on the operation.
   */
  queryParams?: ServiceMiddlewareQueryParam<RequestQueryParamNames>[];

  /**
   * An array of the header names that the middleware will supply.
   * This definition is not used at run-time, because the response headers are
   * defined on the operation.
   */
  responseHeaders?: ServiceMiddlewareOutboundHeader<ResponseHeaderNames>[];

  /**
   * An array of the failure definitions that the middleware might
   * generate instead of completing the processing of a request.
   * This definition is not used at run-time, because the failure
   * definitions are defined on the operation.
   */
  failureDefinitions?: ServiceMiddlewareFailureDefinition<
    RequestFailureTypes
  >[];

  /**
   * A value of true indicates the middleware uses the authentication cookie.
   */
  usesAuthCookie?: boolean;

  /**
   * A value of true indicates the middleware uses the api key header.
   */
  usesAuthApiKey?: boolean;

  /**
   * An asynchronous request processing function that can be
   * used to augment context and wrap/edit the response before and after it is
   * handled by an operation.
   * @param req The request.
   * @param ctx The context object for the request.
   * @param op The operation that will process the request.
   * @param next A function that invokes the next item of middleware.  This should
   * be called exactly once in the execution unless an error is raised.
   */
  handler?: (
    req: ServiceMiddlewareRequest<
      RequestBody,
      RequestHeaderNames,
      RequestQueryParamNames,
      RequestFailureTypes
    >,
    ctx: OperationContext,
    op: Operation,
    next: () => Promise<ServiceMiddlewareResponse>,
  ) => Promise<ServiceMiddlewareResponse>;
}
