import { HttpError, OperationNamedType } from "../interfaces/index.ts";

/**
 * Parses the given string request value, validates it using the
 * given type information and returns the value converted to
 * the target type.
 * @param displayName The display name of the value, e.g. "Header 'abc'".
 * @param rawValue The raw value extracted from the request.
 * @param type The type of the value.
 * @param markedRequired True if the value is marked as required in the
 * configuration of the operation.
 */
export function parseAndValidateRequestValue(
  displayName: string,
  rawValue: string | null,
  type: OperationNamedType,
  markedRequired: boolean,
): unknown {
  if (typeof rawValue === "string" && rawValue.length > 0) {
    const value = parseRequestValue(displayName, rawValue, type.underlyingType);

    const validationResult = type.validator(value, "");

    if (Array.isArray(validationResult) && validationResult.length > 0) {
      throw new HttpError(
        400,
        "REQUEST_PARAMETER_DID_NOT_VALIDATE",
        `${displayName} failed validation.`,
        JSON.stringify(validationResult, null, 2),
      );
    }

    return value;
  } else if (markedRequired) {
    throw new HttpError(
      400,
      "REQUEST_PARAMETER_MISSING",
      `${displayName} is required and must be supplied in the request.`,
    );
  } else {
    // The value was considered optional, so it's safe to return null.
    return null;
  }
}

/**
 * Converts the given raw string extracted from a request to
 * the target type.
 * @param displayName The display name of the value, such as "Header 'abc'".
 * @param rawValue The raw value extracted from the request.
 * @param targetType The target type of the value extracted from the request.
 */
function parseRequestValue(
  displayName: string,
  rawValue: string,
  targetType: "string" | "number" | "boolean" | "object" | "array" | "unknown",
) {
  if (targetType === "string") {
    return rawValue;
  } else if (targetType === "number") {
    const value = parseFloat(rawValue);

    if (isNaN(value)) {
      throw new HttpError(
        400,
        "REQUEST_PARAMETER_VALUE_NOT_A_NUMBER",
        `${displayName} with value '${rawValue}' cannot be converted to a number.`,
      );
    }

    return value;
  } else if (targetType === "boolean") {
    return rawValue === "True" || rawValue === "true" || rawValue === "TRUE" ||
      rawValue === "1";
  } else {
    // This branch handles objects, arrays and unknowns.
    try {
      return JSON.parse(rawValue);
    } catch {
      throw new HttpError(
        400,
        "UNABLE_TO_READ_REQUEST_PARAMETER_AS_JSON",
        `${displayName} cannot be parsed into JSON.`,
      );
    }
  }
}
