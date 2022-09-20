import { OperationNamedType } from "./OperationNamedType.ts";

export interface OperationUrlParam<RequestUrlParamNames extends string> {
  name: RequestUrlParamNames;
  summary: string;
  type: OperationNamedType;
}
