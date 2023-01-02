// import { GenericOperation } from "./Operation.ts";
import { Operation } from "./Operation.ts";
import { OperationNamedType } from "./OperationNamedType.ts";

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
}
