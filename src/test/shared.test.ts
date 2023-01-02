// deno-lint-ignore-file no-explicit-any
import { router } from "../runtime/index.ts";
import {
  Operation,
  OperationContext,
  OperationRequest,
  OperationResponse,
  ServiceConfig,
} from "../interfaces/index.ts";

interface CreateOperationProps {
  setup: (op: Operation) => void;
  handler: (
    req: OperationRequest<
      any,
      string,
      string,
      string
    >,
    ctx: OperationContext,
  ) => Promise<OperationResponse<any, string>>;
}

export function createOperation(props: CreateOperationProps) {
  const shellOp: Operation = {
    urlPattern: "/test",
    name: "Test operation",
    summary: "The test operation",
    operationId: "testOp",
    tags: ["Tests"],
    method: "GET",
    handler: props.handler,
  };

  props.setup(shellOp);

  return shellOp;
}

export function createRouterHandler(
  op: Operation,
  serviceConfigMutator?: (sc: ServiceConfig) => void,
) {
  const serviceConfig: ServiceConfig = {
    title: "Test service",
    description: "The test service.",
    version: "1.0.0",
    namedTypes: [],
    operations: [op],
  };

  if (serviceConfigMutator) {
    serviceConfigMutator(serviceConfig);
  }

  return router(serviceConfig);
}
