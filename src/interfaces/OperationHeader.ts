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
   * A description of the approach to take given that this header is deprecated.
   */
  deprecated?: string;

  /**
   * The name of the middleware module that declared this header.
   */
  fromMiddleware?: string;
}
