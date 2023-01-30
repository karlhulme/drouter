/**
 * Returns a health response.
 */
export function healthResponse() {
  const ghCommit = Deno.env.get("BUILD_GH_COMMIT");
  const dateTime = Deno.env.get("BUILD_DATE_TIME");

  return new Response(
    `Healthy.\n\nBuild Github Commit: ${ghCommit}\nBuild Date/time: ${dateTime}`,
  );
}
