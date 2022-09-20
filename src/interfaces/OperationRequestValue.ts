/**
 * A parsed and validated value extracted from a request.
 */
export interface OperationRequestValue {
  /**
   * The name of the header, query parameter or url parameter.
   */
  name: string;

  /**
   * The value.
   */
  value: unknown;

  /**
   * True if the value was marked as required and is guaranteed
   * to be present after the reading and parsing of the request.
   */
  required: boolean;
}
