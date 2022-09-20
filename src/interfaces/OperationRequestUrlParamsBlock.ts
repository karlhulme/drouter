/**
 * A block of functions for accessing request url parameter values.
 */
export interface OperationRequestUrlParamsBlock<
  RequestUrlParamNames extends string,
> {
  /**
   * Returns the requested number.
   */
  getRequiredNumber: (paramName: RequestUrlParamNames) => number;

  /**
   * Returns the requested string.
   */
  getRequiredString: (paramName: RequestUrlParamNames) => string;

  /**
   * Returns the requested boolean.
   */
  getRequiredBoolean: (paramName: RequestUrlParamNames) => boolean;
}
