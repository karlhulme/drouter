export interface OperationRequestHeadersBlock<
  RequestHeaderNames extends string,
> {
  getRequiredNumber: (paramName: RequestHeaderNames) => number;
  getOptionalNumber: (paramName: RequestHeaderNames) => number | null;
  getRequiredString: (paramName: RequestHeaderNames) => string;
  getOptionalString: (paramName: RequestHeaderNames) => string | null;
  getRequiredBoolean: (paramName: RequestHeaderNames) => boolean;
  getOptionalBoolean: (paramName: RequestHeaderNames) => boolean | null;
  getRequiredObject: <T>(paramName: RequestHeaderNames) => T;
  getOptionalObject: <T>(paramName: RequestHeaderNames) => T | null;
}
