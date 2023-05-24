interface FailureDefinition {
  code: number;
  localType: string;
  summary: string;
  fromMiddleware?: string | null;
}

/**
 * Builds a route failure definition based on
 * an existing failure definition with a local type.
 *
 * This function is used by both the createOperationConst
 * and createMiddlewareConst routes so the fromMiddleware property
 * is returned as-is.
 * @param failureDefinition A failure definition.
 */
export function buildCommonFailureDefinition(
  failureDefinition: FailureDefinition,
) {
  return {
    code: failureDefinition.code,
    summary: failureDefinition.summary,
    type: "/err/" +
      failureDefinition.localType,
    fromMiddleware: failureDefinition.fromMiddleware,
  };
}
