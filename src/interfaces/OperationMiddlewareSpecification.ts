import { OperationMiddlewareSpecificationHeader } from "./OperationMiddlewareSpecificationHeader.ts";
import { OperationMiddlewareSpecificationOutboundHeader } from "./OperationMiddlewareSpecificationOutboundHeader.ts";
import { OperationMiddlewareSpecificationQueryParam } from "./OperationMiddlewareSpecificationQueryParam.ts";

/**
 * Defines the headers and query params that a middleware module
 * understands and the response headers that it will add
 * to the response.
 */
export interface OperationMiddlewareSpecification {
  /**
   * An array of the header names that the middleware will process.
   */
  headers?: OperationMiddlewareSpecificationHeader[];

  /**
   * An array of query parameter names that the middleware will process.
   */
  queryParams?: OperationMiddlewareSpecificationQueryParam[];

  /**
   * An array of the header names that the middleware will supply.
   */
  responseHeaders?: OperationMiddlewareSpecificationOutboundHeader[];
}
