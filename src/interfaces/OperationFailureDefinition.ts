/**
 * A definition of a failure.
 */
export interface OperationFailureDefinition<
  RequestFailureTypes extends string,
> {
  /**
   * The type name of the error that can be raised from
   * this operation.
   */
  type: RequestFailureTypes;

  /**
   * The HTTP code of the error.
   */
  code: number;

  /**
   * A short description of when this error will be raised.
   */
  summary: string;

  /**
   * The name of the middleware module that declared this header.
   */
  fromMiddleware?: string;
}
