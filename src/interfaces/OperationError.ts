/**
 * An error occurred during the processing of an operation.
 */
export class OperationError extends Error {
  /**
   * Constructs a new error.
   * @param code The HTTP status code for this error.
   * @param errorCode The all-caps error code for this error.
   * @param description The one-line description of the error.
   * This field should not contain any line breaks.
   * @param details Additional details associated with the error
   * which can take any form.
   */
  constructor(
    readonly code: number,
    readonly errorCode: string,
    readonly description: string,
    readonly details?: string,
  ) {
    super(
      `Code: ${code}, Error code: ${errorCode}, Description: ${description}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
