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
  handler?: (
    req: OperationRequest<
      any,
      string,
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
    markdown: "The test operation",
    operationId: "testOp",
    tags: ["Tests"],
    flags: [],
    apiVersion: "2000-01-01",
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
    namedTypes: [],
    middleware: [],
    payloadMiddleware: [],
    operations: [op],
  };

  if (serviceConfigMutator) {
    serviceConfigMutator(serviceConfig);
  }

  return router(serviceConfig);
}

export const stdReqInit: RequestInit = {
  headers: {
    "api-version": "2000-01-01",
  },
};

export const stdReqInfo: Deno.ServeHandlerInfo = {
  remoteAddr: {
    hostname: "200.199.198.197",
    port: 4321,
    transport: "tcp",
  },
};
