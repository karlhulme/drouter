export interface OperationRequestQueryParamsBlock<
  RequestQueryParamNames extends string,
> {
  getRequiredNumber: (paramName: RequestQueryParamNames) => number;
  getOptionalNumber: (paramName: RequestQueryParamNames) => number | null;
  getRequiredString: (paramName: RequestQueryParamNames) => string;
  getOptionalString: (paramName: RequestQueryParamNames) => string | null;
  getRequiredBoolean: (paramName: RequestQueryParamNames) => boolean;
  getOptionalBoolean: (paramName: RequestQueryParamNames) => boolean | null;
  getRequiredObject: <T>(paramName: RequestQueryParamNames) => T;
  getOptionalObject: <T>(paramName: RequestQueryParamNames) => T | null;
}
