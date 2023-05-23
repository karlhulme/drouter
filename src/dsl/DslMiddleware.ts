export interface DslMiddleware {
  name: string;
  requiresPayload: boolean;
  order: number;

  headers?: {
    name: string;
    summary: string;
    type: string;
    isRequired?: boolean;
    isAuthApiKey?: boolean;
    deprecated?: string;
  }[];
  queryParams?: {
    name: string;
    summary: string;
    type: string;
    deprecated?: string;
  }[];
  responseHeaders?: {
    name: string;
    summary: string;
    type: string;
    isGuaranteed?: boolean;
    deprecated?: string;
  }[];
  responseFailureDefinitions?: {
    code: number;
    localType: string;
    summary: string;
  }[];

  usesAuthCookie?: boolean;
  usesAuthApiKey?: boolean;
}
