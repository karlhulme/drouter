import { OperationRequestValue } from "./OperationRequestValue.ts";

/**
 * A block of functions for accessing request header values.
 */
export interface OperationRequestHeadersBlock<
  RequestHeaderNames extends string,
> {
  /**
   * Returns all the header values.
   */
  getAllValues: () => OperationRequestValue[];

  /**
   * Returns the requested number value.
   */
  getRequiredNumber: (paramName: RequestHeaderNames) => number;

  /**
   * Returns the requested number value or null.
   */
  getOptionalNumber: (paramName: RequestHeaderNames) => number | null;

  /**
   * Returns the requested string value.
   */
  getRequiredString: (paramName: RequestHeaderNames) => string;

  /**
   * Returns the requested string value or null.
   */
  getOptionalString: (paramName: RequestHeaderNames) => string | null;

  /**
   * Returns the requested boolean value.
   */
  getRequiredBoolean: (paramName: RequestHeaderNames) => boolean;

  /**
   * Returns the requested boolean value or null.
   */
  getOptionalBoolean: (paramName: RequestHeaderNames) => boolean | null;

  /**
   * Returns the requested object value.
   */
  getRequiredObject: <T>(paramName: RequestHeaderNames) => T;

  /**
   * Returns the requested object value or null.
   */
  getOptionalObject: <T>(paramName: RequestHeaderNames) => T | null;
}
