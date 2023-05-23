import { HttpError, Operation } from "../index.ts";

/**
 * Returns an HttpError constructed by combining the relevant
 * failure information declared for the given operation with
 * the given details about this specific instance of the error.
 * @param op An operation.
 * @param type The type name of an error.
 * @param detail A description of the problem that is relevant
 * to this specific instance of the error.
 * @param properties A record of additional information about
 * the error.
 */
export function createHttpError(
  op: Operation,
  type: string,
  detail?: string,
  properties?: Record<string, unknown>,
) {
  const failureDefs = op.responseFailureDefinitions || [];
  const failure = failureDefs.find((rfd) => rfd.type === type);

  if (failure) {
    // If the failure is recognised then we can build an HttpError
    // with a combination of the documented error information and the
    // details of this specific instance.
    const qualifiedType = "/errors" +
      op.urlPattern.replaceAll(/:[^/]+/g, "-") +
      "/" +
      op.method.toLowerCase() + "/" +
      type;

    return new HttpError(
      failure.code,
      qualifiedType,
      failure.summary,
      detail,
      properties,
    );
  } else {
    // If the failure isn't recognised then we return a server error
    // but include information about the type of error so it can
    // be added to the documentation.
    return new HttpError(
      500,
      "/errors/common/unexpectedError",
      "An undocumented error has been raised.",
      `An error with local type name of ${type} was raised.`,
    );
  }
}
