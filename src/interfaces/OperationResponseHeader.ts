export interface OperationResponseHeader<RequestHeaderNames extends string> {
  name: RequestHeaderNames;
  value: unknown;
}
