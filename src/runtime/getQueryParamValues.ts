import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { parseAndValidateRequestValue } from "./parseAndValidateRequestValue.ts";

/**
 * Returns an array of request values extracted from the given
 * query parameters.
 * @param queryParams The query parameters from an HTTP request object.
 * @param op An operation.
 */
export function getQueryParamValues(
  queryParams: URLSearchParams,
  op: GenericOperation,
) {
  const queryParamValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestQueryParams)) {
    for (const queryParam of op.requestQueryParams) {
      const rawValue = queryParams.get(queryParam.name);

      const value = parseAndValidateRequestValue(
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
