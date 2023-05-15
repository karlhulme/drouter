/**
 * Returns a new Response that describes an error in RFC 7807 format.
 * IETF Standard https://datatracker.ietf.org/doc/html/rfc7807
 * Writeup https://lakitna.medium.com/understanding-problem-json-adf68e5cf1f8
 * The standard defines a title property that describes the error but
 * may not change from occurence to occurence.  We therefore use the detail
 * property which is instance-specific and thus more likely to be useful.
 * @param code An HTTP status code.
 * @param path The path that was originally requested.  The error will be
 * scoped underneath this path as "/<path>/errors/<type>".  The path should
 * include a leading slash.  If the error is common to multiple routes
 * then supply '/common'.
 * @param type The lowercase hyphen-separated type code for the error.
 * @param detail A description of this specific instance of the issue.
 * @param properties Additional properties for the error defined as a record
 * of strings.
 * @param additionalHeaders A set of additional headers that should
 * be added to the response.
 */
export function errorResponse(
  code: number,
  path: string,
  type: string,
  detail: string,
  properties?: Record<string, string | undefined>,
  additionalHeaders?: HeadersInit,
) {
  const normalisedPath = path.endsWith("/") ? path : path + "/";

  const problem = {
    status: code,
    type: normalisedPath + "errors/" + type,
    detail,
    ...properties,
  };

  return new Response(
    JSON.stringify(problem),
    {
      status: code,
      headers: {
        "content-type": "application/problem+json;charset=utf-8",
        ...additionalHeaders,
      },
    },
  );
}
