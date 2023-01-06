/**
 * Returns a new Response that describes an error.
 * @param code An HTTP status code.
 * @param errorCode The all-caps error code for the error.
 * @param description A short description of the error.
 * @param details Additional details for the error which can take any form.
 * @param additionalHeaders A set of additional headers that should
 * be added to the response.
 */
export function errorResponse(
  code: number,
  errorCode: string,
  description: string,
  details?: string,
  additionalHeaders?: HeadersInit,
) {
  return new Response(
    `${code} ${errorCode} ${description}\n${details}`,
    {
      status: code,
      headers: {
        "content-type": "text/plain;charset=utf-8",
        ...additionalHeaders,
      },
    },
  );
}
