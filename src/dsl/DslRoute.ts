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
  middleware?: string[];
  flags?: string[];
  headers?: DslRouteMethodHeader[];
  queryParams?: DslRouteMethodQueryParam[];
  requestBodyProperties?: {
    name: string;
    summary: string;
    propertyType: string;
    isRequired?: boolean;
    isArray?: boolean;
    isNullable?: boolean;
    deprecated?: string;
  }[];
  requestBodyRawText?: boolean;
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
  responseHeaders?: DslRouteMethodResponseHeader[];
  responseBodyType?: string;
  responseBodyTypeArray?: boolean;
  responseFailureDefinitions?: DslRouteMethodFailureDefinition[];

  deprecated?: string;
}

export interface DslRouteMethodHeader {
  name: string;
  summary: string;
  type: string;
  isRequired?: boolean;
  deprecated?: string;
}

export interface DslRouteMethodQueryParam {
  name: string;
  summary: string;
  type: string;
  deprecated?: string;
}

export interface DslRouteMethodResponseHeader {
  name: string;
  summary: string;
  type: string;
  isGuaranteed?: boolean;
  deprecated?: string;
}

export interface DslRouteMethodFailureDefinition {
  code: number;
  localType: string;
  summary: string;
}
