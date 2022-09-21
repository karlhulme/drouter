import { GenericOperation } from "./Operation.ts";
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
   */
  operations: GenericOperation[];
}
