/**
 * An error occurred during the processing of an operation.
 */
export class OperationError extends Error {
  constructor(
    /**
     * The HTTP status code for this error.
     */
    readonly status: number,
    /**
     * The all-caps error code for this error.
     */
    readonly errorCode: string,
    /**
     * The description of the error.
     */
    readonly description: string,
    /**
     * Any JSON-stringifiable details object that further describes
     * this error or how to resolve it.
     */
    readonly details?: unknown,
  ) {
    super(
      `Status: ${status}, Error code: ${errorCode}, Description: ${description}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
