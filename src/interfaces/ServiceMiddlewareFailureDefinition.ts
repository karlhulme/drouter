/**
 * A failure definition that may be returned by a middleware module.
 */
export interface ServiceMiddlewareFailureDefinition<
  RequestFailureTypes extends string,
> {
  /**
   * The type name of the error.  This will typically be prefixed
   * by the /err path.
   */
  type: RequestFailureTypes;

  /**
   * The HTTP code of the error.
   */
  code: number;

  /**
   * A short description of when this error will be raised.
   */
  summary: string;
}
