/**
 * Returns true if the given api key is valid.
 * @param suppliedApiKey The api key supplied with a request.
 * @param apiKeyEnvNames An array of the names of the environment variables
 * that contain valid api keys.
 */
export function isApiKeyValid(
  suppliedApiKey: string,
  apiKeyEnvNames: string[],
) {
  for (const apiKeyEnvName of apiKeyEnvNames) {
    if (Deno.env.get(apiKeyEnvName) === suppliedApiKey) {
      return true;
    }
  }

  return false;
}
