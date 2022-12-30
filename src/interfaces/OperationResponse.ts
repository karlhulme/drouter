import { OperationResponseHeader } from "./OperationResponseHeader.ts";

/**
 * Te response to the operation.
 */
export interface OperationResponse<
  ResponseBodyType = never,
  ResponseHeaderNames extends string = never,
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
