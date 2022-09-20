/**
 * Describes a type with schema and validator.
 */
export interface OperationNamedType {
  /**
   * The unique name of a type.
   */
  name: string;
  /**
   * A JSON schema object.
   */
  schema: unknown;
  /**
   * The underlying type.
   */
  underlyingType: "string" | "number" | "boolean" | "object" | "array";
  /**
   * A function that evaluates a value and returns validation errors.
   */
  // deno-lint-ignore no-explicit-any
  validator: (value: any, valueDisplayPath: string) => any[];
}
