import { HttpError, Operation } from "../interfaces/index.ts";

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
        "REQUEST_BODY_JSON_DID_NOT_VALIDATE.",
        "The request body JSON failed validation.",
        JSON.stringify(validationResult, null, 2),
      );
    }
  }
}
