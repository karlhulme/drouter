import { OperationRequestValue } from "./OperationRequestValue.ts";

/**
 * A block of functions for accessing request query parameter values.
 */
export interface OperationRequestQueryParamsBlock<
  RequestQueryParamNames extends string,
> {
  /**
   * Returns all the query parameter values.
   */
  getAllValues: () => OperationRequestValue[];

  /**
   * Returns the requested number.
   */
  getRequiredNumber: (paramName: RequestQueryParamNames) => number;

  /**
   * Returns the requested number or null.
   */
  getOptionalNumber: (paramName: RequestQueryParamNames) => number | null;

  /**
   * Returns the requested string.
   */
  getRequiredString: (paramName: RequestQueryParamNames) => string;

  /**
   * Returns the requested string or null.
   */
  getOptionalString: (paramName: RequestQueryParamNames) => string | null;

  /**
   * Returns the requested boolean.
   */
  getRequiredBoolean: (paramName: RequestQueryParamNames) => boolean;

  /**
   * Returns the requested boolean or null.
   */
  getOptionalBoolean: (paramName: RequestQueryParamNames) => boolean | null;

  /**
   * Returns the requested object.
   */
  getRequiredObject: <T>(paramName: RequestQueryParamNames) => T;

  /**
   * Returns the requested object or null.
   */
  getOptionalObject: <T>(paramName: RequestQueryParamNames) => T | null;
}
