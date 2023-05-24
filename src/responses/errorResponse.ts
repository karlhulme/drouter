/**
 * Returns a new Response that describes an error in RFC 7807 format.
 * IETF Standard https://datatracker.ietf.org/doc/html/rfc7807
 * Writeup https://lakitna.medium.com/understanding-problem-json-adf68e5cf1f8
 * The standard defines a title property that describes the error but
 * may not change from occurence to occurence, and a detail
 * property which is instance-specific.
 * @param code An HTTP status code.
 * @param type A unique URI for the error which is usually prefixed
 * with /errors and will include a representation of the path that
 * raised the error.
 * @param title A description of the scenario when this error is raised.
 * @param detail A description of this specific instance of the issue.
 * @param properties Additional properties for the error defined as a record
 * of strings.
 * @param additionalHeaders A set of additional headers that should
 * be added to the response.
 */
export function errorResponse(
  code: number,
  type: string,
  title: string,
  detail?: string,
  properties?: Record<string, unknown>,
  additionalHeaders?: Record<string, string>,
) {
  const problem = {
    status: code,
    type,
    title,
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
