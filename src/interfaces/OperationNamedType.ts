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
   * An array of JSON schema types referenced by this schema.
   */
  referencedSchemaTypes: string[];

  /**
   * The underlying type.
   */
  underlyingType:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "unknown";

  /**
   * A function that evaluates a value and returns validation errors.
   */
  // deno-lint-ignore no-explicit-any
  validator: (value: any, valueDisplayPath: string) => any[];
}
