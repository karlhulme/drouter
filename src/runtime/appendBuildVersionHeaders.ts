/**
 * Appends a set of headers that describe the version of the service.
 * The build-gh-commit header is the SHA for the code commit that was
 * used for this build.  The build-date-time was the date and time
 * that the image was built.
 * @param responseHeaders The current set of headers that this
 * method can append to.
 */
export function appendBuildVersionHeaders(
  responseHeaders: Headers,
) {
  responseHeaders.append(
    "build-gh-commit",
    Deno.env.get("BUILD_GH_COMMIT") || "<blank>",
  );

  responseHeaders.append(
    "build-date-time",
    Deno.env.get("BUILD_DATE_TIME") || "<blank>",
  );
}
