import { OperationNamedType } from "./OperationNamedType.ts";

/**
 * A header returned in the response for an operation.
 */
export interface OperationHeaderOutbound<ResponseHeaderNames extends string> {
  /**
   * The name of the header.
   */
  name: ResponseHeaderNames;

  /**
   * A summary of the header's usage.
   */
  summary: string;

  /**
   * True if the header will always be returned.
   */
  isGuaranteed?: boolean;

  /**
   * The type of data expected in the header.
   */
  type: OperationNamedType;

  /**
   * True if the header will not be returned in the future.
   */
  deprecated?: boolean;
}
