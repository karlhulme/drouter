/**
 * Returns a response for when an internal server error occurs.
 * @param underlyingRequest The request being processed.
 * @param additionalHeaders Additional headers to be appended to the response.
 */
export function internalServerErrorResponse(
  underlyingRequest: Request,
  additionalHeaders?: HeadersInit,
) {
  const headline =
    "500 INTERNAL_SERVER_ERROR Unexpected error raised processing request.";
  const details = `${underlyingRequest.method} ${underlyingRequest.url}`;

  return new Response(
    `${headline}\n${details}`,
    {
      status: 500,
      headers: {
        "content-type": "text/plain;charset=utf-8",
        ...additionalHeaders,
      },
    },
  );
}
