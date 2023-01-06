/**
 * A header that is provided by a middleware module.
 */
export interface ServiceMiddlewareSpecificationOutboundHeader {
  /**
   * The name of the outbound header.
   */
  name: string;

  /**
   * The reason for the deprecation and/or the header to use instead.
   */
  deprecated?: string;

  /**
   * A description of the header.
   */
  summary: string;

  /**
   * True if the header is guaranteed to be supplied, otherwise false.
   */
  isGuaranteed?: boolean;
}
