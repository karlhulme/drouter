/**
 * A definition of a failure.
 */
export interface OperationFailureDefinition {
  /**
   * The HTTP code of the error.
   */
  code: number;

  /**
   * A summary of the failure.
   */
  summary: string;
}
