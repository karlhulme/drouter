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
   * The version of the service.
   */
  version: string;

  /**
   * A description of the service.
   */
  description: string;

  /**
   * An array of named types.
   */
  namedTypes: OperationNamedType[];

  /**
   * The name of the string type that is used for API version and
   * headers handled by middleware.  For example: stdLongString.
   */
  stringTypeName: string;

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
   * True if the api-version header is optional rather than required.
   * This is typically enabled explictly for dev environments.  On
   * production environments clients should be required to specify
   * a version.
   */
  optionalApiVersionHeader?: boolean;

  /**
   * An array of acceptable request origins for CORs requests.
   */
  permittedCorsOrigins?: string[];

  /**
   * The name of the environment variables that contain the api keys.
   * If an array with at least one element is supplied, then all
   * operation routes will require an x-api-key header to be supplied.
   * The common routes such as /, /openapi, /health and OPTIONS
   * requests will not require the api key to work.
   */
  apiKeyEnvNames?: string[];
}
