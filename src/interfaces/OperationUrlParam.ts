import { OperationNamedType } from "./OperationNamedType.ts";

/**
 * A url parameter passed in the request as part of an operation.
 */
export interface OperationUrlParam<RequestUrlParamNames extends string> {
  /**
   * The name of a url parameter.
   */
  name: RequestUrlParamNames;

  /**
   * The summary of a url parameter's usage.
   */
  summary: string;

  /**
   * The type of data expected in the url parameter.
   */
  type: OperationNamedType;
}
