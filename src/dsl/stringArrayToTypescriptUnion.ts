/**
 * Returns a Typescript union based on the given strings,
 * or 'never' if the array is empty.  This is useful for
 * typing query params, url params and header names.
 * @param arr An array of strings.
 */
export function stringArrayToTypescriptUnion(arr: string[]) {
  if (arr.length === 0) {
    return "never";
  } else {
    return arr
      .map((element) => `"${element}"`)
      .join("|");
  }
}
