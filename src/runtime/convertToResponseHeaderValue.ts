/**
 * Converts the given value to a string representation for a response header.
 * @param value Any value.
 */
export function convertToResponseHeaderValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    return value.toString();
  } else if (typeof value === "boolean") {
    return value ? "true" : "false";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return "";
  }
}
