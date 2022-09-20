import { OperationError } from "../interfaces/index.ts";

// converts a string value into the target type.
export function parseRequestValue(
  displayName: string,
  rawValue: string,
  targetType: "string" | "number" | "boolean" | "object" | "array",
) {
  if (targetType === "string") {
    return rawValue;
  } else if (targetType === "number") {
    const value = parseFloat(rawValue);

    if (isNaN(value)) {
      throw new OperationError(
        400,
        `${displayName} with value '${rawValue}' cannot be converted to a number.`,
      );
    }

    return value;
  } else if (targetType === "boolean") {
    return rawValue === "True" || rawValue === "true" || rawValue === "TRUE";
  } else {
    try {
      return JSON.parse(rawValue);
    } catch {
      throw new OperationError(
        400,
        `${displayName} cannot be parsed into JSON.`,
      );
    }
  }
}
