import { OperationError } from "../interfaces/index.ts";

/**
 * Returns an OperationError object built from a string.
 * This is useful for converting an error generated in a
 * downstream service into an error object which can be handled
 * by an upstream service.
 * If the message cannot be parsed, it is converted to a 500 error.
 * @param message The error message.
 */
export function parseErrorResponse(
  message: string,
): OperationError {
  try {
    const [header, ...detailsParts] = message.split("\n");
    const [errorCode, statusText, ...descriptionParts] = header.split(" ");

    const status = parseInt(statusText);

    if (isNaN(status)) {
      // We don't need any details because the catch records the full input string.
      // This requirement that the second word be a number also decreases the changes
      // of an invalid message string being parsed successfully.
      throw new Error();
    }

    const description = descriptionParts.join(" ");

    const detailsJson = detailsParts.join("");
    const details = typeof detailsJson === "string" && detailsJson.length > 1
      ? JSON.parse(detailsJson)
      : undefined;

    return new OperationError(
      status,
      errorCode,
      description,
      details,
    );
  } catch {
    console.log("Unable to parse errorResponse: " + message);

    return new OperationError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Unable to parse errorResponse.",
    );
  }
}
