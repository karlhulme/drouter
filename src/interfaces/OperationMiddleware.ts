/**
 * A reference to a middleware module that is used by an operation.
 */
export interface OperationMiddleware {
  /**
   * The name of a middleware module.
   */
  name: string;

  /**
   * A set of flags that are passed to the middleware function
   * when invoked at runtime.
   */
  flags?: string[];
}
