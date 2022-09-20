/**
 * A definition of a failure.
 */
export interface OperationFailureDefinition {
  /**
   * The HTTP code of the error.
   */
  status: number;

  /**
   * A summary of the failure.
   */
  summary: string;
}
