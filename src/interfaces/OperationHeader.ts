import { OperationNamedType } from "./OperationNamedType.ts";

/**
 * A header passed in the request for an operation.
 */
export interface OperationHeader<RequestHeaderNames extends string> {
  /**
   * The name of the header.
   */
  name: RequestHeaderNames;

  /**
   * A summary of the header's usage.
   */
  summary: string;

  /**
   * True if the header must be supplied.
   */
  isRequired?: boolean;

  /**
   * The type of data expected in the header.
   */
  type: OperationNamedType;

  /**
   * True if the header should not be supplied for new projects.
   */
  deprecated?: boolean;
}
