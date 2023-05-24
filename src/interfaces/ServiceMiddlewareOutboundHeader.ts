/**
 * A header that is provided by a middleware module.
 */
export interface ServiceMiddlewareOutboundHeader<
  ResponseHeaderNames extends string,
> {
  /**
   * The name of the outbound header.
   */
  name: ResponseHeaderNames;

  /**
   * The reason for the deprecation and/or the header to use instead.
   */
  deprecated?: string;

  /**
   * A description of the header.
   */
  summary: string;

  /**
   * A value that indicates if the header can only be included on a success response.
   */
  successOnly?: boolean;
}
