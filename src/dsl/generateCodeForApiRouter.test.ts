import { assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { assertStringIncludes } from "../../deps.ts";
import { generateCodeForApiRouter } from "./generateCodeForApiRouter.ts";

Deno.test("Convert populated array into typescript union.", () => {
  // To cover code generation we need resources that are:
  // * urlParams: defined or undefined
  // * summary: populated and unpopulated
  // * headers: defined or undefined
  // * responseHeaders: defined or undefined
  // * queryParams: defined or undefined
  // * requiresApiKey: true or undefined
  // * requiresCookieAuth: true or undefined
  // * deprecated: true or undefined

  const sourceCode = generateCodeForApiRouter({
    depsPath: "../deps.ts",
    resources: [
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiHeader.json",
        "name": "inbound-header",
        "summary": "The inbound test header.",
        "type": "std/uuid",
        "deprecated": "Not in use.",
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiHeader.json",
        "name": "req-inbound-header",
        "summary": "The inbound test header.",
        "type": "std/uuid",
        "isRequired": true,
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiOutboundHeader.json",
        "name": "outbound-header",
        "summary": "The outbound test header.",
        "type": "std/maxString",
        "deprecated": "Not in use.",
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiOutboundHeader.json",
        "name": "gtd-outbound-header",
        "summary": "The outbound test header.",
        "type": "std/maxString",
        "isGuaranteed": true,
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiOutboundRecord.json",
        "system": "svc",
        "name": "test",
        "pluralName": "tests",
        "summary": "A test.",
        "properties": [
          {
            "name": "id",
            "summary": "The id of a test.",
            "propertyType": "std/idWithPrefix",
            "isRequired": true,
          },
        ],
        "types": {
          "records": [{
            "name": "innerRecord",
            "pluralName": "innerRecords",
            "summary": "The inner record.",
            "properties": [{
              "name": "field1",
              "propertyType": "std/bool",
              "summary": "This is field1.",
            }],
          }],
          "enums": [{
            "name": "innerEnum",
            "pluralName": "innerEnums",
            "summary": "The inner enum.",
            "items": [{
              "value": "one",
              "summary": "The one.",
            }],
          }],
        },
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiRoute.json",
        "system": "svc",
        "urlPattern": "/tests",
        "methods": [{
          "method": "GET",
          "name": "Get tests",
          "operationId": "getClubs",
          "queryParams": [
            {
              "name": "query-param",
              "summary": "The test query param.",
              "type": "std/idWithPrefix",
            },
            {
              "name": "unused-query-param",
              "summary": "The test query param.",
              "type": "std/idWithPrefix",
              "deprecated": "Not in use.",
            },
          ],
          "responseBodyType": "svc/test",
          "responseBodyTypeArray": true,
          "requiresApiKey": true,
          "requiresCookieAuth": true,
          "usesSetCookie": true,
          "acceptIdempotencyKey": true,
          "usesUserAgent": true,
          "deprecated": "Not in use.",
        }],
      },
      {
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiRoute.json",
        "system": "svc",
        "urlPattern": "/tests/:testId",
        "urlParams": [{
          "name": "testId",
          "summary": "The id of a test.",
          "type": "std/idWithPrefix",
        }],
        "tags": ["Testing"],
        "flags": ["FlagTesting"],
        "methods": [{
          "method": "GET",
          "name": "Get test",
          "markdown": "Get the test record.",
          "operationId": "getTest",
          "responseBodyType": "svc/test",
        }, {
          "method": "PATCH",
          "name": "Update club",
          "operationId": "updateClub",
          "headerNames": ["inbound-header", "req-inbound-header"],
          "responseHeaderNames": ["outbound-header", "gtd-outbound-header"],
          "requestBodyProperties": [{
            "name": "someProp",
            "propertyType": "std/shortStringDisplayable",
            "summary": "The display name of the test.",
            "isNullable": true,
          }],
          "responseBodyType": "svc/test",
          "responseSuccessCode": 123,
          "responseFailureDefinitions": [{
            code: 532,
            summary: "Non standard error.",
          }],
          "requestBodyTypes": {
            "records": [{
              "name": "methodRecord",
              "pluralName": "methodRecords",
              "summary": "The method record.",
              "properties": [{
                "name": "field1",
                "propertyType": "std/bool",
                "summary": "This is field1.",
              }],
            }],
            "enums": [{
              "name": "methodEnum",
              "pluralName": "methodEnums",
              "summary": "The method enum.",
              "items": [{
                "value": "one",
                "summary": "The one.",
              }],
            }],
          },
        }],
      },
    ],
  });

  assertStringIncludes(sourceCode, "allOperations");
  assertStringIncludes(sourceCode, "getTest");
});

Deno.test("Fail to generate api router code for an invalid resource.", () => {
  assertThrows(() =>
    generateCodeForApiRouter({
      depsPath: "../deps.ts",
      resources: [{
        $schema: "invalid",
      }],
    })
  );
});

Deno.test("Fail to generate api router code when an unknown header is referenced.", () => {
  assertThrows(() =>
    generateCodeForApiRouter({
      depsPath: "../deps.ts",
      resources: [{
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiRoute.json",
        "system": "svc",
        "urlPattern": "/tests",
        "methods": [{
          "method": "GET",
          "name": "Get test",
          "operationId": "getTest",
          "headerNames": ["unknown-header"],
        }],
      }],
    })
  );
});

Deno.test("Fail to generate api router code when an unknown outbound header is referenced.", () => {
  assertThrows(() =>
    generateCodeForApiRouter({
      depsPath: "../deps.ts",
      resources: [{
        "$schema":
          "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/apiRoute.json",
        "system": "svc",
        "urlPattern": "/tests",
        "methods": [{
          "method": "GET",
          "name": "Get test",
          "operationId": "getTest",
          "responseHeaderNames": ["unknown-header"],
        }],
      }],
    })
  );
});
