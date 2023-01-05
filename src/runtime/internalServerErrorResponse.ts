/**
 * Returns a response for when an internal server error occurs.
 */
export function internalServerErrorResponse() {
  return new Response(
    "500 INTERNAL_SERVER_ERROR Unexpected error raised processing request.",
    {
      status: 500,
      headers: {
        "content-type": "text/plain;charset=utf-8",
      },
    },
  );
}
