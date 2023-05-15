import { validationErrorToString } from "./validationErrorToString.ts";
import { assertStrictEquals } from "../../deps.ts";

Deno.test("Convert values for response headers.", () => {
  assertStrictEquals(
    validationErrorToString({
      "valuePath": "requestBody.remoteIp",
      "msg": "Value is a required property and cannot be undefined.",
      "type": "std/shortString",
    }),
    "valuePath: requestBody.remoteIp\nmsg: Value is a required property and cannot be undefined.\ntype: std/shortString\n",
  );
});
