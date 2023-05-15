/**
 * Returns a string representation of the given validation error object
 * whereby each property appears on it's own line.  The returned string
 * will include a final new line character.
 * @param validationError A validation error object.
 */
// deno-lint-ignore no-explicit-any
export function validationErrorToString(validationError: any) {
  let output = "";

  for (const propName in validationError) {
    const propValue = validationError[propName];

    if (typeof propValue === "string") {
      output += `${propName}: ` + validationError[propName].toString() + "\n";
    }
  }

  return output;
}
