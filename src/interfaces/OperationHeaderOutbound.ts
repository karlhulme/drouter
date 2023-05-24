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
   * A value that indicates if the header can only be included on a success response.
   */
  successOnly?: boolean;

  /**
   * The type of data expected in the header.
   */
  type: OperationNamedType;

  /**
   * A description of the approach to take given that this header is deprecated.
   */
  deprecated?: string;

  /**
   * The name of the middleware module that declared this header.
   */
  fromMiddleware?: string;
}
