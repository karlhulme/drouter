import { OperationNamedType } from "../interfaces/OperationNamedType.ts";

/**
 * Returns an apiVersion type.
 */
export function createApiVersionType(): OperationNamedType {
  return {
    name: "apiVersion",
    referencedSchemaTypes: [],
    underlyingType: "string",
    validator: () => [],
    schema: {
      type: "string",
      description: "An API version string.",
    },
  };
}
