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
   * A description of the approach to take given that this query param is deprecated.
   */
  deprecated?: string;

  /**
   * The name of the middleware module that declared this header.
   */
  fromMiddleware?: string;
}
