import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { readRequestValue } from "./readRequestValue.ts";

export function getUrlParamValues(
  urlParams: Record<string, string>,
  op: GenericOperation,
) {
  const urlParamValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestUrlParams)) {
    for (const reqUrlParam of op.requestUrlParams) {
      const rawValue = urlParams[reqUrlParam.name];
      const value = readRequestValue(
        `Url param '${reqUrlParam.name}'`,
        rawValue,
        reqUrlParam.type,
        true,
      );

      urlParamValues.push({
        name: reqUrlParam.name,
        value,
        required: true,
      });
    }
  }

  return urlParamValues;
}
