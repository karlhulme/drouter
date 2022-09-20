import { OperationError } from "../interfaces/index.ts";

export function createErrorResponse(err: OperationError) {
  return new Response(
    JSON.stringify({
      message: err.message,
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
