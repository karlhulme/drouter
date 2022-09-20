export function convertUrlPatternToOpenApiPath(path: string) {
  return path.replaceAll(/\/:[^:{}/]+/g, (subString) => {
    return "/{" + subString.slice(2) + "}";
  });
}
