import { HttpError, Operation } from "../interfaces/index.ts";

/**
 * Extracts, validates and returns the body of the given HTTP request
 * according to the request type information specification in the
 * given operation.
 * @param req An HTTP request.
 * @param operation An operation.
 */
export async function getJsonBody(
  req: Request,
  operation: Operation,
): Promise<unknown> {
  if (operation.requestBodyType) {
    let body;

    try {
      body = await req.json();
    } catch {
      throw new HttpError(
        400,
        "UNABLE_TO_READ_REQUEST_BODY_AS_JSON",
        "The request body does not contain well-formed JSON.",
      );
    }

    const validationResult = operation.requestBodyType.validator(
      body,
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

    return body;
  } else {
    return null;
  }
}
