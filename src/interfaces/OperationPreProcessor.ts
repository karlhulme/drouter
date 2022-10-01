import { OperationContext } from "./OperationContext.ts";

/**
 * A function that will run on all requests before the
 * request is handed to the operation.
 * If the request should be aborted, a pre-processor can
 * raise an OperationError.
 */
export type OperationPreProcessor = (
  req: Request,
  ctx: OperationContext,
) => Promise<void>;
