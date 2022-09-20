import { OperationResponseHeader } from "./OperationResponseHeader.ts";

/**
 * Te response to the operation.
 */
export interface OperationResponse<
  ResponseBodyType,
  ResponseHeaderNames extends string,
> {
  /**
   * The body of the response.
   */
  body: ResponseBodyType;

  /**
   * An array of response headers.
   */
  headers?: OperationResponseHeader<ResponseHeaderNames>[];

  /**
   * The status code to return.
   */
  status?: number;
}
