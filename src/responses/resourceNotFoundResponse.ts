/**
 * Returns a response for when a requested resource was not found.
 */
export function resourceNotFoundResponse() {
  return new Response(
    "404 OPERATION_NOT_FOUND The requested operation was not found.",
    {
      status: 404,
      headers: {
        "content-type": "text/plain;charset=utf-8",
      },
    },
  );
}
