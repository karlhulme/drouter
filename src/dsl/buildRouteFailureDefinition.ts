interface FailureDefinition {
  code: number;
  localType: string;
  summary: string;
}

/**
 * Builds a route failure definition based on route information and
 * an existing failure definition with a local type.
 * @param urlPattern The url pattern used to match the route with inbound requests.
 * @param method The verb used on the request.
 * @param failureDefinition A failure definition.
 */
export function buildRouteFailureDefinition(
  urlPattern: string,
  method: string,
  failureDefinition: FailureDefinition,
) {
  return {
    code: failureDefinition.code,
    summary: failureDefinition.summary,
    type: "/errors/" +
      method.toLowerCase() +
      urlPattern.replaceAll(/:[^/]+/g, "-") +
      "/" +
      failureDefinition.localType,
  };
}
