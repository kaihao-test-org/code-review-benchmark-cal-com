import { expect, it } from "vitest";

import dayjs from "@calcom/dayjs";

import { combineLimitWindows } from "./combineWindows";

const window = {
  limitDateFrom: dayjs.utc("2025-01-01T00:00:00Z"),
  limitDateTo: dayjs.utc("2025-01-31T23:59:59Z"),
};
it("preserves a single or duplicate scope", () => {
  for (const windows of [[window], [window, window]]) {
    const result = combineLimitWindows(windows, window);
    expect(result.limitDateFrom.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    expect(result.limitDateTo.toISOString()).toBe("2025-01-31T23:59:59.000Z");
  }
});
it("returns the requested window without policies", () => {
  expect(combineLimitWindows([], window)).toBe(window);
});
