/**
 * Returns the given url pattern in the form expected for the
 * OpenAPI specification.  For example /users/:userId becomes
 * /users/{userId}.
 * @param path A path optionally containing url parameters.
 */
export function convertUrlPatternToOpenApiPath(path: string) {
  return path.replaceAll(/\/:[^:{}/]+/g, (subString) => {
    return "/{" + subString.slice(2) + "}";
  });
}
