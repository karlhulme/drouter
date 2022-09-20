import { OperationError, OperationNamedType } from "../interfaces/index.ts";
import { parseRequestValue } from "./parseRequestValue.ts";

// read the value from the request (which includes conversion) and then validate it
export function readRequestValue(
  displayName: string,
  rawValue: string | null,
  type: OperationNamedType,
  markedRequired: boolean,
): unknown {
  if (typeof rawValue === "string" && rawValue.length > 0) {
    const value = parseRequestValue(displayName, rawValue, type.underlyingType);

    const validationResult = type.validator(value, "");

    if (validationResult.length > 0) {
      throw new OperationError(
        400,
        `${displayName} is not valid.`,
        validationResult,
      );
    }

    return value;
  } else if (markedRequired) {
    throw new OperationError(
      400,
      `${displayName} is required and must be supplied in the request.`,
    );
  } else {
    // The value was considered optional, so it's safe to return null.
    return null;
  }
}
