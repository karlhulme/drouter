import { assertEquals } from "../../deps.ts";
import { todayString } from "./todayString.ts";

Deno.test("Today string returns a date in yyyy-MM-dd format.", () => {
  const dtStr = todayString();
  assertEquals(/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(dtStr), true);
});
