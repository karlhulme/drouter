/**
 * An error occurred during the processing of an operation.
 */
export class OperationError extends Error {
  constructor(
    readonly status: number,
    readonly message: string,
    readonly details?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
