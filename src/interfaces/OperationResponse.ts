import { OperationResponseHeader } from "./OperationResponseHeader.ts";

/**
 * Te response to the operation.
 */
export interface OperationResponse<
  ResponseBodyType = unknown,
  ResponseHeaderNames extends string = string,
> {
  /**
   * The body of the response.
   */
  body?: ResponseBodyType;

  /**
   * An array of response headers.
   */
  headers?: OperationResponseHeader<ResponseHeaderNames>[];
}
