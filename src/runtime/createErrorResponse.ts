import { OperationError } from "../interfaces/index.ts";

/**
 * Returns a response for an error.
 * @param err An operation error.
 */
export function createErrorResponse(err: OperationError) {
  return new Response(
    JSON.stringify({
      errorCode: err.errorCode,
      description: err.description,
      details: err.details,
    }),
    {
      status: err.status,
      headers: {
        "content-type": "application/json",
      },
    },
  );
}
