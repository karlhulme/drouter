export interface DslMiddleware {
  name: string;

  includeRoutes: {
    verbs: ("DELETE" | "GET" | "PATCH" | "POST" | "PUT")[];
    pattern: string;
  }[];
  excludeRoutes?: {
    verbs: ("DELETE" | "GET" | "PATCH" | "POST" | "PUT")[];
    pattern: string;
  }[];

  headers?: {
    name: string;
    summary: string;
    type: string;
    isRequired?: boolean;
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
}
