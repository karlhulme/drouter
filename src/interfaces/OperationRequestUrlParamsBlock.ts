export interface OperationRequestUrlParamsBlock<
  RequestUrlParamNames extends string,
> {
  getRequiredNumber: (paramName: RequestUrlParamNames) => number;
  getRequiredString: (paramName: RequestUrlParamNames) => string;
  getRequiredBoolean: (paramName: RequestUrlParamNames) => boolean;
}
