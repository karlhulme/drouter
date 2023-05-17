import { ServiceMiddlewareSpecificationFailureDefinition } from "./ServiceMiddlewareSpecificationFailureDefinition.ts";
import { ServiceMiddlewareSpecificationHeader } from "./ServiceMiddlewareSpecificationHeader.ts";
import { ServiceMiddlewareSpecificationOutboundHeader } from "./ServiceMiddlewareSpecificationOutboundHeader.ts";
import { ServiceMiddlewareSpecificationQueryParam } from "./ServiceMiddlewareSpecificationQueryParam.ts";

/**
 * Defines the headers and query params that a middleware module
 * understands and the response headers that it will add
 * to the response.
 */
export interface ServiceMiddlewareSpecification {
  /**
   * An array of the header names that the middleware will process.
   */
  headers?: ServiceMiddlewareSpecificationHeader[];

  /**
   * An array of query parameter names that the middleware will process.
   */
  queryParams?: ServiceMiddlewareSpecificationQueryParam[];

  /**
   * An array of the header names that the middleware will supply.
   */
  responseHeaders?: ServiceMiddlewareSpecificationOutboundHeader[];

  /**
   * An array of the failure definitions that the middleware might
   * generate instead of completing the processing of a request.
   */
  failureDefinitions?: ServiceMiddlewareSpecificationFailureDefinition[];
}
