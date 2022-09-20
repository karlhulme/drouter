/**
 * A header returned from an operation.
 */
export interface OperationResponseHeader<RequestHeaderNames extends string> {
  /**
   * The name of a response header.
   */
  name: RequestHeaderNames;

  /**
   * The value of a response header.
   */
  value: unknown;
}
