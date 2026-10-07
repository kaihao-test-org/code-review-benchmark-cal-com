import { expect, it } from "vitest";
import dayjs from "@calcom/dayjs";
import { formatIntervalDateKey } from "./formatIntervalDateKey";
it("encodes a UTC interval date", () => {
  expect(formatIntervalDateKey(dayjs.utc("2025-01-01T12:30:00Z"))).toBe("2025-01-01");
});
it("encodes the year boundary", () => {
  expect(formatIntervalDateKey(dayjs.utc("2024-12-31T23:59:00Z"))).toBe("2024-12-31");
});
