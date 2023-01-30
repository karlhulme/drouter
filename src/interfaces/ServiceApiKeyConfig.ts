/**
 * The configuration of the api key handling for the service.
 */
export interface ServiceApiKeyConfig {
  /**
   * True if the x-api-key header is marked optional in the openapi
   * declaration and not inspected when an operation is invoked.
   * This is useful for development scenarios.
   */
  optional?: boolean;

  /**
   * An array of the environment variables that contain acceptable
   * values for the x-api-key header.
   */
  envVarNames: string[];
}
