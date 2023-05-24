interface FailureDefinition {
  code: number;
  localType: string;
  summary: string;
  fromMiddleware: string | null;
}

/**
 * Builds a route failure definition based on route information and
 * an existing failure definition with a local type.
 * @param operationId The id of the operation.
 * @param failureDefinition A failure definition.
 */
export function buildRouteFailureDefinition(
  operationId: string,
  failureDefinition: FailureDefinition,
) {
  return {
    code: failureDefinition.code,
    summary: failureDefinition.summary,
    type: "/err/" +
      operationId + "/" +
      failureDefinition.localType,
    fromMiddleware: failureDefinition.fromMiddleware,
  };
}
