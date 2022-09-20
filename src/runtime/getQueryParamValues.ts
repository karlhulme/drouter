import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { readRequestValue } from "./readRequestValue.ts";

export function getQueryParamValues(
  queryParams: URLSearchParams,
  op: GenericOperation,
) {
  const queryParamValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestQueryParams)) {
    for (const queryParam of op.requestQueryParams) {
      const rawValue = queryParams.get(queryParam.name);
      const value = readRequestValue(
        `Query param '${queryParam.name}'`,
        rawValue,
        queryParam.type,
        Boolean(queryParam.isRequired),
      );

      queryParamValues.push({
        name: queryParam.name,
        value,
        required: Boolean(queryParam.isRequired),
      });
    }
  }

  return queryParamValues;
}
