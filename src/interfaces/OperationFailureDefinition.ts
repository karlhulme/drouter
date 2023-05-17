/**
 * A definition of a failure.
 */
export interface OperationFailureDefinition {
  /**
   * The HTTP code of the error.
   */
  code: number;

  /**
   * The local type name of the error which can be appended
   * to a request path to produce a unique type.
   */
  localType: string;

  /**
   * A short description of when this error will be raised.
   */
  summary: string;
}
