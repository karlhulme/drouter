import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";

/**
 * Returns a value from a pre-validated set of values extracted
 * from the request and supplied to an operation during the processing
 * of a request.
 * @param operation An operation.
 * @param displayName The name of the value being requested, such as "Header 'abc'"".
 * @param name The name of the value being requested.
 * @param values The set of pre-validated values to retrieve from.
 * @param targetType The expected type of the value that the operation is trying to request.
 * @param requiredValue True if the operation is expecting the value to be guaranteed to
 * be available.
 */
export function getRequestValue(
  operation: GenericOperation,
  displayName: string,
  name: string,
  values: OperationRequestValue[],
  targetType: "string" | "number" | "boolean" | "object",
  requiredValue: boolean,
) {
  for (const v of values) {
    if (v.name === name) {
      if (requiredValue && !v.required) {
        throw new Error(
          `${displayName} was not declared as required but the route tried to retrieve a required value.`,
        );
      }

      if (v.value === null) {
        // We've already raised an error if the value was required but not supplied.
        return null;
      } else {
        if (targetType === "string" && typeof v.value !== "string") {
          throw new Error(`${displayName} was not declared as a string.`);
        } else if (targetType === "number" && typeof v.value !== "number") {
          throw new Error(`${displayName} was not declared as a number.`);
        } else if (targetType === "boolean" && typeof v.value !== "boolean") {
          throw new Error(`${displayName} was not declared as a boolean.`);
        }

        return v.value;
      }
    }
  }

  throw new Error(
    `${name} was not declared for ${operation.method} ${operation.urlPattern}.`,
  );
}
