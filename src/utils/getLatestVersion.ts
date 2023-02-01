/**
 * Returns the highest version number from the given set
 * of versions or the string "N/A".
 * @param versions An array of versions.
 */
export function getLatestVersion(versions: string[]): string {
  return versions
    .sort((a, b) => a.localeCompare(b))
    .pop() || "N/A";
}
