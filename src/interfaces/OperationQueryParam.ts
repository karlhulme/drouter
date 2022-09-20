import { OperationNamedType } from "./OperationNamedType.ts";

export interface OperationQueryParam<RequestQueryParamNames extends string> {
  name: RequestQueryParamNames;
  summary: string;
  isRequired?: boolean;
  type: OperationNamedType;
  deprecated?: boolean;
}
