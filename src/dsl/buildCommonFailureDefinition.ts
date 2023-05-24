interface FailureDefinition {
  code: number;
  localType: string;
  summary: string;
  fromMiddleware: string | null;
}

/**
 * Builds a route failure definition based on
 * an existing failure definition with a local type.
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
