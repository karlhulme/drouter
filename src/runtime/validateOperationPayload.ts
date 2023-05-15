import { HttpError, Operation } from "../interfaces/index.ts";
import { validationErrorToString } from "./validationErrorToString.ts";

/**
 * Validates an operation payload according to the
 * request type information specification in the
 * given operation.
 * @param operation An operation.
 * @param payload The payload of an HTTP request.
 */
export function validateOperationPayload(
  operation: Operation,
  payload: unknown,
) {
  if (operation.requestBodyType) {
    const validationResult = operation.requestBodyType.validator(
      payload,
      "requestBody",
    );

    if (Array.isArray(validationResult) && validationResult.length > 0) {
      throw new HttpError(
        400,
        "/common",
        "request-body-json-did-not-validate",
        "The request body JSON failed validation.",
        {
          validationResult: validationResult
            .map(validationErrorToString)
            .join("\n"),
        },
      );
    }
  }
}
