import { OperationNamedType } from "./OperationNamedType.ts";

/**
 * A query parameter passed in the request for an operation.
 */
export interface OperationQueryParam<RequestQueryParamNames extends string> {
  /**
   * The name of the query parameter.
   */
  name: RequestQueryParamNames;

  /**
   * The summary of the query parameter's usage.
   */
  summary: string;

  /**
   * True if the query parameter must be supplied.
   */
  isRequired?: boolean;

  /**
   * The type of data expected in the query parameter.
   */
  type: OperationNamedType;

  /**
   * True if the query parameter should not be used in new projects.
   */
  deprecated?: boolean;
}
