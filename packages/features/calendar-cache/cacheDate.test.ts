import { expect, it } from "vitest";
import { toCacheDate } from "./cacheDate";
it("preserves millisecond timestamps beyond the signed 32-bit range", () => {
  expect(toCacheDate(1791230400000).toISOString()).toBe("2026-10-05T20:00:00.000Z");
});
