/**
 * A header that is processed by a middleware module.
 */
export interface ServiceMiddlewareHeader<
  RequestHeaderNames extends string = string,
> {
  /**
   * The name of the header.
   */
  name: RequestHeaderNames;

  /**
   * The reason for the deprecation and/or the header to use instead.
   */
  deprecated?: string;

  /**
   * A description of the header.
   */
  summary: string;

  /**
   * True if the header is required, otherwise false.
   */
  isRequired?: boolean;
}
