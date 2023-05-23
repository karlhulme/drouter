import { assertThrows } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { assertStringIncludes } from "../../deps.ts";
import { generateCodeForApiRouter } from "./generateCodeForApiRouter.ts";

Deno.test("Generate api router code for service, outbound records and routes.", () => {
  // To cover code generation we need resources that are:
  // * urlParams: defined or undefined
  // * summary: populated and unpopulated
  // * headers: defined or undefined
  // * responseHeaders: defined or undefined
  // * queryParams: defined or undefined
  // * requiresApiKey: true or undefined
  // * requiresCookieAuth: true or undefined
  // * deprecated: true or undefined

  const sourceCode = generateCodeForApiRouter([
    {
      $schema:
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/service.json",
      depsPath: "../deps.ts",
    },
    {
      "$schema":
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/middleware.json",
      "name": "mw",
      "headers": [{
        "name": "mw-header",
        "summary": "A middlware header.",
        "type": "std/maxString",
      }, {
        "name": "req-mw-header",
        "summary": "A required middleware header.",
        "type": "std/maxString",
        "isRequired": true,
        "deprecated": "No longer used.",
      }],
      "queryParams": [{
        "name": "qp",
        "summary": "A query param",
        "type": "std/maxString",
        "deprecated": "No longer used.",
      }],
      "responseFailureDefinitions": [{
        "code": 123,
        "localType": "problemHere",
        "summary": "The problem that occurred.",
      }],
      "responseHeaders": [{
        "name": "mw-header-out",
        "summary": "A middlware response header.",
        "type": "std/maxString",
      }, {
        "name": "req-mw-header-out",
        "summary": "A required middleware response header.",
        "type": "std/maxString",
        "isGuaranteed": true,
        "deprecated": "No longer used.",
      }],
    },
    {
      "$schema":
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/outboundRecord.json",
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
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/route.json",
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
        "https://raw.githubusercontent.com/karlhulme/drouter/main/schemas/route.json",
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
        "middleware": [{
          "name": "mw",
        }],
        "headers": [{
          "name": "inbound-header",
          "summary": "An inbound header",
          "type": "std/maxString",
        }, {
          "name": "req-inbound-header",
          "summary": "a required inbound header",
          "type": "std/maxString",
          "isRequired": true,
          "deprecated": "This is no longer used.",
        }],
        "responseHeaders": [{
          "name": "outbound-header",
          "summary": "An outbound header",
          "type": "std/maxString",
        }, {
          "name": "gtd-outbound-header",
          "summary": "a required outbound header",
          "type": "std/maxString",
          "isGuaranteed": true,
          "deprecated": "This is no longer used.",
        }],
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
  ]);

  assertStringIncludes(sourceCode, "allOperations");
  assertStringIncludes(sourceCode, "getTest");
});

Deno.test("Fail to generate api router code if service resource not included.", () => {
  assertThrows(
    () => generateCodeForApiRouter([]),
    "service resource was not found",
  );
});
