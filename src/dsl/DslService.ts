export interface DslService {
  depsPath: string;
  title: string;
  description: string;
  overviewHtml?: string;
  authHtml?: string;
  authApiKeyHeaderName?: string;
  authCookieName?: string;
  permittedCorsOrigins?: string[];
}
