// deno-lint-ignore-file no-explicit-any
import {
  appendJsonotronTypesToTree,
  EnumTypeDef,
  generateTypescript,
  newTypescriptTree,
  RecordTypeDef,
  stdSystemTypes,
} from "../../deps.ts";
import { DslOutboundRecord } from "./DslOutboundRecord.ts";
import { DslRoute } from "./DslRoute.ts";
import { DslService } from "./DslService.ts";
import { createOperationConst } from "./createOperationConst.ts";

/**
 * Returns the source code for drouter operation functions
 * which can be passed directly to the drouter constructor.
 * @param resources An array of resource files.
 */
export function generateCodeForApiRouter(resources: any[]) {
  const service: DslService = resources.find((r) =>
    r.$schema ===
      "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/service.json"
  );

  if (!service) {
    throw new Error("A service resource was not found.");
  }

  // Create the typescript tree for all the types and functions
  // that we're going to define.
  const tree = newTypescriptTree();

  // Add the imports that are expected to be in the deps file.
  tree.imports.push(
    ...[
      "Operation",
    ].map((impt) => ({ name: impt, path: service.depsPath })),
  );

  // Create a list of types and seed it with the standard types.
  const types = [...stdSystemTypes];

  // Start a list of operations
  const operationNames: string[] = [];

  for (const resource of resources) {
    if (
      resource["$schema"] ===
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/outboundRecord.json"
    ) {
      const outboundRecord = resource as DslOutboundRecord;

      // Create a record definition from the top-level outbound record.
      types.push({
        system: outboundRecord.system,
        kind: "record",
        name: outboundRecord.name,
        pluralName: outboundRecord.pluralName,
        summary: outboundRecord.summary,
        labels: outboundRecord.labels,
        tags: outboundRecord.tags,
        properties: outboundRecord.properties,
        deprecated: outboundRecord.deprecated,
      } as RecordTypeDef<string>);

      // Create an enum definition from any child enums defined in this outbound record.
      if (
        typeof outboundRecord.types === "object" &&
        Array.isArray(outboundRecord.types.enums)
      ) {
        for (const resEnum of outboundRecord.types.enums) {
          types.push({
            system: outboundRecord.system,
            kind: "enum",
            name: resEnum.name,
            pluralName: resEnum.pluralName,
            summary: resEnum.summary,
            deprecated: resource.deprecated,
            items: resEnum.items,
          } as EnumTypeDef);
        }
      }

      // Create a record definition from any child records defined in this outbound record.
      if (
        typeof outboundRecord.types === "object" &&
        Array.isArray(outboundRecord.types.records)
      ) {
        for (const resRecord of outboundRecord.types.records) {
          types.push({
            system: outboundRecord.system,
            kind: "record",
            name: resRecord.name,
            pluralName: resRecord.pluralName,
            summary: resRecord.summary,
            deprecated: resource.deprecated,
            properties: resRecord.properties,
          } as RecordTypeDef<string>);
        }
      }
    } else if (
      resource["$schema"] ===
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/route.json"
    ) {
      const apiRoute = resource as DslRoute;

      for (const method of apiRoute.methods) {
        // Create a const declaration for the method that can be
        // override by code within the service.
        tree.constDeclarations.push(
          createOperationConst(apiRoute, method),
        );

        // Update the list of operation names for export as a
        // single array at the end.
        operationNames.push(method.operationId);

        // Create a record definition from the method request body.
        if (Array.isArray(method.requestBodyProperties)) {
          types.push({
            system: resource.system,
            kind: "record",
            name: `${method.operationId}RequestBody`,
            pluralName: `${method.operationId}RequestBodies`,
            summary:
              `The request body for the ${method.operationId} operation.`,
            labels: [],
            tags: [],
            properties: method.requestBodyProperties,
          } as RecordTypeDef<string>);

          // Create an enum definition from any child enums defined in this method request body.
          if (
            typeof method.requestBodyTypes === "object" &&
            Array.isArray(method.requestBodyTypes.enums)
          ) {
            for (const rbEnum of method.requestBodyTypes.enums) {
              types.push({
                system: resource.system,
                kind: "enum",
                name: rbEnum.name,
                pluralName: rbEnum.pluralName,
                summary: rbEnum.summary,
                deprecated: resource.deprecated,
                items: rbEnum.items,
              } as EnumTypeDef);
            }
          }

          // Create a record definition from any child records defined in this outbound record.
          if (
            typeof method.requestBodyTypes === "object" &&
            Array.isArray(method.requestBodyTypes.records)
          ) {
            for (const rbRecord of method.requestBodyTypes.records) {
              types.push({
                system: resource.system,
                kind: "record",
                name: rbRecord.name,
                pluralName: rbRecord.pluralName,
                summary: rbRecord.summary,
                deprecated: resource.deprecated,
                properties: rbRecord.properties,
              } as RecordTypeDef<string>);
            }
          }
        }
      }
    } else if (
      [
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/service.json",
      ].includes(resource["$schema"])
    ) {
      // No types are defined in these resources.
    } else {
      throw new Error(
        `The $schema property on the resource was not recognised.\n${
          resource["$schema"]
        }`,
      );
    }
  }

  // Append all the type definitions to the tree.
  appendJsonotronTypesToTree(tree, types, "#/components/schemas/");

  // append methods into an array that can be added to router
  tree.constDeclarations.push({
    name: "allOperations",
    value: "[" + operationNames.join(", ") + "]",
    exported: true,
    outputGeneration: 3,
  });

  return generateTypescript(tree);
}
