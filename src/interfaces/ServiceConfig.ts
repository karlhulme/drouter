import { Operation } from "./Operation.ts";
import { OperationNamedType } from "./OperationNamedType.ts";
import { ServiceMiddleware } from "./ServiceMiddleware.ts";

/**
 * The configuration of the service.
 */
export interface ServiceConfig {
  /**
   * The title of the service.
   */
  title: string;

  /**
   * A short description of the service.
   */
  description: string;

  /**
   * The html that will appear on the overview page.
   */
  overviewHtml?: string;

  /**
   * The html that will appear on the authentication page.
   */
  authHtml?: string;

  /**
   * An array of named types.
   */
  namedTypes: OperationNamedType[];

  /**
   * An array of middleware modules that operate before
   * the body has been read from the request.
   */
  middleware?: ServiceMiddleware[];

  /**
   * An array of middleware modules that operate after
   * the body has been read from the request and placed
   * into the context.
   */
  payloadMiddleware?: ServiceMiddleware[];

  /**
   * An array of RESTful operations.
   * The actual operations should be based on the Operation interface
   * and a set of narrowing type params.  Unfortunately a handler
   * with a narrowed type (SvcEntity, number, never) cannot treated as
   * unknown, so operations will need to be explicitly cast down.
   */
  operations: Operation[];

  /**
   * The name of the cookie used for authentication.
   */
  authCookieName?: string;

  /**
   * The name of the header that accepts an api-key for authentication.
   */
  authApiKeyHeaderName?: string;

  /**
   * An array of acceptable request origins for CORs requests.
   */
  permittedCorsOrigins?: string[];
}
