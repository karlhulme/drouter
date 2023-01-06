import { Operation } from "./Operation.ts";
import { OperationContext } from "./OperationContext.ts";

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
   */
  process: (
    req: Request,
    ctx: OperationContext,
    op: Operation,
    next: () => Promise<Response>,
  ) => Promise<Response>;
}
