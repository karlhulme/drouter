export interface DslRoute {
  system: string;
  urlPattern: string;
  urlParams: {
    name: string;
    summary: string;
    type: string;
  }[];
  tags?: string[];

  methods: DslRouteMethod[];
}

export interface DslRouteMethod {
  name: string;
  operationId: string;
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  apiVersion: string;

  markdown?: string;
  flags?: string[];
  headerNames?: string[];
  queryParams?: {
    name: string;
    summary: string;
    type: string;
    deprecated?: string;
  }[];
  requestBodyProperties?: {
    name: string;
    summary: string;
    propertyType: string;
    isRequired?: boolean;
    isArray?: boolean;
    isNullable?: boolean;
    deprecated?: string;
  }[];
  requestBodyTypes?: {
    enums?: {
      name: string;
      pluralName: string;
      summary: string;
      deprecated?: string;
      tags?: string[];
      labels?: { name: string; value: string }[];
      items: {
        value: string;
        summary?: string;
        deprecated?: string;
      }[];
    }[];

    records?: {
      name: string;
      pluralName: string;
      summary: string;
      deprecated?: string;
      tags?: string[];
      labels?: { name: string; value: string }[];
      properties: {
        name: string;
        summary: string;
        propertyType: string;
        isRequired?: boolean;
        isArray?: boolean;
        deprecated?: string;
      }[];
    }[];
  };

  responseSuccessCode?: number;
  responseHeaderNames?: string[];
  responseBodyType?: string;
  responseBodyTypeArray?: boolean;
  responseFailureDefinitions?: {
    code: number;
    localType: string;
    summary: string;
  }[];

  requiresApiKey?: boolean;
  requiresCookieAuth?: boolean;
  usesUserAgent?: boolean;
  usesSetCookie?: boolean;
  acceptIdempotencyKey?: boolean;
  deprecated?: string;
}