import { OperationNamedType } from "./OperationNamedType.ts";

export interface OperationHeaderOutbound<ResponseHeaderNames extends string> {
  name: ResponseHeaderNames;
  summary: string;
  isGuaranteed?: boolean;
  type: OperationNamedType;
  deprecated?: boolean;
}
