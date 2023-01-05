/**
 * Returns a response for when a downstream service fails to respond.
 */
export function downstreamErrorResponse() {
  return new Response(
    "504 DOWNSTREAM_CONNECTION_FAILED Unable to reach a downstream server.",
    {
      status: 404,
      headers: {
        "content-type": "text/plain;charset=utf-8",
      },
    },
  );
}
