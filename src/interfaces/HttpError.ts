/**
 * An error occurred during the processing of an HTTP request.
 */
export class HttpError extends Error {
  /**
   * Constructs a new error.
   * @param code An HTTP status code.
   * @param type The fully-qualified URI of the error.
   * @param title A description of the scenario when the error is raised.
   * @param detail A description of the error that is specific to this
   * occurence of the problem.
   * @param properties Additional properties for the error defined as a record
   * of JSON serialisable types.
   * @param additionalHeaders Additional values to be added as header values.
   */
  constructor(
    readonly code: number,
    readonly type: string,
    readonly title: string,
    readonly detail?: string,
    readonly properties?: Record<string, unknown>,
    readonly additionalHeaders?: Record<string, string>,
  ) {
    super(
      `Code: ${code}\nType: ${type}\nTitle: ${title}\nDetails: ${
        detail || ""
      }\n${JSON.stringify(properties) || ""}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
