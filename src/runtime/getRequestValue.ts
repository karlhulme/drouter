import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";

// called when the value is retrieved during the request
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
