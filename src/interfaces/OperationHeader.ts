import { OperationNamedType } from "./OperationNamedType.ts";

export interface OperationHeader<RequestHeaderNames extends string> {
  name: RequestHeaderNames;
  summary: string;
  isRequired?: boolean;
  type: OperationNamedType;
  deprecated?: boolean;
}
