/**
 * An error occurred during the processing of an HTTP request.
 */
export class HttpError extends Error {
  /**
   * Constructs a new error.
   * @param code An HTTP status code.
   * @param path The path that was originally requested.  The error will be
   * scoped underneath this path as "/<path>/errors/<type>".  The path should
   * include a leading slash.  If the error is common to multiple routes
   * then supply '/common'.
   * @param type The lowercase hyphen-separated type code for the error.
   * @param detail A description of the error that is specific to this
   * occurence of the problem.
   * @param properties Additional properties for the error defined as a record
   * of JSON serialisable types.
   */
  constructor(
    readonly code: number,
    readonly path: string,
    readonly type: string,
    readonly detail: string,
    readonly properties?: Record<string, unknown>,
  ) {
    const normalisedPath = path.endsWith("/") ? path : path + "/";

    super(
      `Code: ${code}, Type: ${normalisedPath}/errors/${type}, Details: ${detail}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}
