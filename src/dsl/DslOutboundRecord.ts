export interface DslOutboundRecord {
  system: string;
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
    isNullable?: boolean;
    deprecated?: string;
  }[];

  types?: {
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
}
