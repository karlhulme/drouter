import { Operation } from "./Operation.ts";
import { OperationContext } from "./OperationContext.ts";
import { OperationMiddlewareSpecification } from "./OperationMiddlewareSpecification.ts";

/**
 * A middleware module that can defines processing and handling
 * that is shared by multiple operations.
 */
export interface OperationMiddleware {
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
  process: (
    req: Request,
    ctx: OperationContext,
    op: Operation,
    next: () => Promise<Response>,
  ) => Promise<Response>;

  /**
   * Returns the headers, query params and response headers that
   * the given operation understands.  All the parameters are declared
   * as a string type and validation must be done by the middleware.
   * @param op An operation.
   */
  specify: (op: Operation) => OperationMiddlewareSpecification;
}
