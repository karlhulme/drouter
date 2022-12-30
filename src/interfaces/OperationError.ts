/**
 * An error occurred during the processing of an operation.
 */
export class OperationError extends Error {
  constructor(
    /**
     * The HTTP status code for this error.
     */
    readonly code: number,
    /**
     * The all-caps error code for this error.
     */
    readonly errorCode: string,
    /**
     * The one-line description of the error.  This field should not
     * contain any line breaks.
     */
    readonly description: string,
    /**
     * Additional details associated with the error which can take
     * any form.
     */
    readonly details?: string,
  ) {
    super(
      `Code: ${code}, Error code: ${errorCode}, Description: ${description}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
