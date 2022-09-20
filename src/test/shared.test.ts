// deno-lint-ignore-file no-explicit-any
import { router } from "../runtime/index.ts";
import {
  GenericOperation,
  OperationRequest,
  OperationResponse,
} from "../interfaces/index.ts";

interface CreateOperationProps {
  setup: (op: GenericOperation) => void;
  handler: (
    req: OperationRequest<
      any,
      string,
      string,
      string
    >,
  ) => Promise<OperationResponse<any, string>>;
}

export function createOperation(props: CreateOperationProps) {
  const shellOp: GenericOperation = {
    urlPattern: "/test",
    name: "Test operation",
    summary: "The test operation",
    operationId: "testOp",
    tags: ["Tests"],
    method: "GET",
    requestHeaders: [],
    requestQueryParams: [],
    requestUrlParams: [],
    responseSuccessCode: 200,
    handler: props.handler,
  };

  props.setup(shellOp);

  return shellOp;
}

export function createRouterHandler(op: GenericOperation) {
  return router({
    title: "Test service",
    description: "The test service.",
    version: "1.0.0",
    operations: [op],
  });
}
