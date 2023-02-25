import { favicon } from "../autogen.favicon.ts";

/**
 * Returns an API fav icon response.
 */
export function faviconResponse() {
  return new Response(favicon());
}
