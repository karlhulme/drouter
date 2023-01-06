/**
 * Returns the length of the given array, or zero,
 * if the array is not defined.
 * @param arr An array.
 */
export function safeArray<T>(arr?: T[] | null) {
  return Array.isArray(arr) ? arr : [];
}
