import { GenericOperation } from "./Operation.ts";

export interface RouterConfig {
  title: string;
  version: string;
  description: string;
  operations: GenericOperation[];
}
