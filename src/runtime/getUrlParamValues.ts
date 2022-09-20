import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { parseAndValidateRequestValue } from "./parseAndValidateRequestValue.ts";

/**
 * Returns an array of request values extracted from the given
 * url parameters.
 * @param urlParams The url parameters from an HTTP request object.
 * @param op An operation.
 */
export function getUrlParamValues(
  urlParams: Record<string, string>,
  op: GenericOperation,
) {
  const urlParamValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestUrlParams)) {
    for (const reqUrlParam of op.requestUrlParams) {
      const rawValue = urlParams[reqUrlParam.name];

      const value = parseAndValidateRequestValue(
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
