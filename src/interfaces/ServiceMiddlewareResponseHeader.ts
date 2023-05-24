/**
 * A header returned from a middleware module.
 */
export interface ServiceMiddlewareResponseHeader<
  RequestHeaderNames extends string,
> {
  /**
   * The name of a response header.
   */
  name: RequestHeaderNames;

  /**
   * The value of a response header.
   */
  value: unknown;
}
