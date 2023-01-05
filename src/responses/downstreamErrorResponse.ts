/**
 * Returns a response for when a downstream service fails to respond.
 * @param additionalHeaders Additional headers to be appended to the response.
 */
export function downstreamErrorResponse(additionalHeaders?: HeadersInit) {
  return new Response(
    "504 DOWNSTREAM_CONNECTION_FAILED Unable to reach a downstream server.",
    {
      status: 404,
      headers: {
        "content-type": "text/plain;charset=utf-8",
        ...additionalHeaders,
      },
    },
  );
}
