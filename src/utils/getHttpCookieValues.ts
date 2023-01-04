import { HttpCookie } from "../interfaces/index.ts";

/**
 * Returns an array of cookies whereby each cookie is a
 * name and value pair;
 * @param cookieHeaderString A cookie header from a request.
 */
export function getHttpCookieValues(
  cookieHeaderString: string,
): HttpCookie[] {
  return cookieHeaderString
    .split(";")
    .filter((c) => c)
    .map((c) => {
      const [name, value] = c.trim().split("=", 2);
      return {
        name,
        value,
      };
    });
}
