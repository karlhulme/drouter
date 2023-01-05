import { HttpError } from "../index.ts";

/**
 * Returns a response for when the input has been rejected.
 * @param err An HTTP error.
 */
export function badInputErrorResponse(err: HttpError) {
  return new Response(
    `${err.code} ${err.errorCode} ${err.description}.\n${err.details}`,
    {
      status: err.code,
      headers: {
        "content-type": "text/plain;charset=utf-8",
      },
    },
  );
}
