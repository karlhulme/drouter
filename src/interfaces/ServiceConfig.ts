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
   * A description of the service.
   */
  description: string;

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
   * A function that is invoked to parse an Api Key and return an object
   * that represents the authenticated user which is written into the
   * context as 'operationApiKeyUser'.  If the api key is invalid then a
   * falsey value should be returned so that an HTTP 401 can be returned.
   */
  apiKeyHandler?: (op: Operation, apiKey: string) => Promise<unknown>;

  /**
   * An array of acceptable request origins for CORs requests.
   */
  permittedCorsOrigins?: string[];
}
