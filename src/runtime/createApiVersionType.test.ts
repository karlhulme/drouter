import { createApiVersionType } from "./createApiVersionType.ts";

Deno.test("Create an api version type.", () => {
  const apiVersionType = createApiVersionType();
  apiVersionType.validator("", "");
});
