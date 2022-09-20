import { OperationResponseHeader } from "./OperationResponseHeader.ts";

export interface OperationResponse<
  ResponseBodyType,
  ResponseHeaderNames extends string,
> {
  body: ResponseBodyType;
  headers?: OperationResponseHeader<ResponseHeaderNames>[];
  status?: number;
}
