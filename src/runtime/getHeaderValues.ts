import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { parseAndValidateRequestValue } from "./parseAndValidateRequestValue.ts";

/**
 * Returns an array of request values extracted from the given
 * headers.
 * @param headers The headers from an HTTP request object.
 * @param op An operation.
 */
export function getHeaderValues(headers: Headers, op: GenericOperation) {
  const headerValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestHeaders)) {
    for (const header of op.requestHeaders) {
      const rawValue = headers.get(header.name);

      const value = parseAndValidateRequestValue(
        `Header '${header.name}'`,
        rawValue,
        header.type,
        Boolean(header.isRequired),
      );

      // All headers are stored with lowercase key names.
      headerValues.push({
        name: header.name.toLowerCase(),
        value,
        required: Boolean(header.isRequired),
      });
    }
  }

  return headerValues;
}
