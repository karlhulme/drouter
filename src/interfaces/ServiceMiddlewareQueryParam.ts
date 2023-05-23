/**
 * A query parameter that is processed by a middleware module.
 */
export interface ServiceMiddlewareQueryParam {
  /**
   * The name of a query parameter.
   */
  name: string;

  /**
   * The reason for the deprecation and/or the query parameter to use instead.
   */
  deprecated?: string;

  /**
   * A description of the usage of the query parameter.
   */
  summary: string;

  /**
   * True if the query parameter is required, otherwise false.
   */
  isRequired?: boolean;
}
