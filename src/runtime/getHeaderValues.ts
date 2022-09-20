import {
  GenericOperation,
  OperationRequestValue,
} from "../interfaces/index.ts";
import { readRequestValue } from "./readRequestValue.ts";

export function getHeaderValues(req: Request, op: GenericOperation) {
  const headerValues: OperationRequestValue[] = [];

  if (Array.isArray(op.requestHeaders)) {
    for (const header of op.requestHeaders) {
      const rawValue = req.headers.get(header.name);
      const value = readRequestValue(
        `Header '${header.name}'`,
        rawValue,
        header.type,
        Boolean(header.isRequired),
      );

      headerValues.push({
        name: header.name,
        value,
        required: Boolean(header.isRequired),
      });
    }
  }

  return headerValues;
}
