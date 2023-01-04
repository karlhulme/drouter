/**
 * An HTTP cookie read from an HTTP cookies header.
 */
export interface HttpCookie {
  /**
   * The name of the cookie.
   */
  name: string;

  /**
   * The value of the cookie.
   */
  value: string;
}
