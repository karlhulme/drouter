/**
 * A failure definition that may be returned by a middleware module.
 */
export interface ServiceMiddlewareSpecificationFailureDefinition {
  /**
   * The HTTP code of the error.
   */
  code: number;

  /**
   * The type name of the error.  This will typically be prefixed
   * by the /errors/common path.
   */
  type: string;

  /**
   * A short description of when this error will be raised.
   */
  summary: string;
}
