import { Operation } from "./Operation.ts";
import { OperationContext } from "./OperationContext.ts";
import { ServiceMiddlewareFailureDefinition } from "./ServiceMiddlewareFailureDefinition.ts";
import { ServiceMiddlewareHeader } from "./ServiceMiddlewareHeader.ts";
import { ServiceMiddlewareOutboundHeader } from "./ServiceMiddlewareOutboundHeader.ts";
import { ServiceMiddlewareQueryParam } from "./ServiceMiddlewareQueryParam.ts";

/**
 * A middleware module that can defines processing and handling
 * that is shared by multiple operations.
 */
export interface ServiceMiddleware {
  /**
   * The name of a middleware module.
   */
  name: string;

  /**
   * An array of the header names that the middleware will process.
   */
  headers?: ServiceMiddlewareHeader[];

  /**
   * An array of query parameter names that the middleware will process.
   */
  queryParams?: ServiceMiddlewareQueryParam[];

  /**
   * An array of the header names that the middleware will supply.
   */
  responseHeaders?: ServiceMiddlewareOutboundHeader[];

  /**
   * An array of the failure definitions that the middleware might
   * generate instead of completing the processing of a request.
   */
  failureDefinitions?: ServiceMiddlewareFailureDefinition[];

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
   * handled by an operation.  This function uses the raw untyped and unvalidated
   * request and response that is provided by the HTTP server.  This function
   * should generate Response objects and not rely on throwing Error objects that the
   * root router function will catch - as all details of the error location will be
   * obscured as a consequence.
   * @param req The underlying HTTP request.
   * @param ctx The context object for the request.
   * @param op The operation that will process the request.
   */
  process?: (
    req: Request,
    ctx: OperationContext,
    op: Operation,
    flags: string[],
    next: () => Promise<Response>,
  ) => Promise<Response>;
}
