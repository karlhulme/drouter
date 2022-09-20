import { GenericOperation, OperationError } from "../interfaces/index.ts";

/**
 * Extracts, validates and returns the body of the given HTTP request
 * according to the request type information specification in the
 * given operation.
 * @param req An HTTP request.
 * @param operation An operation.
 */
export async function getJsonBody(
  req: Request,
  operation: GenericOperation,
): Promise<unknown> {
  if (operation.requestBodyType) {
    let body;

    try {
      body = await req.json();
    } catch {
      throw new OperationError(
        400,
        `Unable to read JSON from request.`,
      );
    }

    const validationResult = operation.requestBodyType.validator(body, "");

    if (Array.isArray(validationResult) && validationResult.length > 0) {
      throw new OperationError(
        400,
        "JSON body does not pass validation.",
        validationResult,
      );
    }

    return body;
  } else {
    return null;
  }
}
