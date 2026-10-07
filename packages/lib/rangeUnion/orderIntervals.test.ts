import { expect, it } from "vitest";

import { orderDateIntervals } from "./orderIntervals";

it("orders separated intervals without changing inputs", () => {
  const ranges = [
    { start: new Date("2025-01-03T00:00:00Z"), end: new Date("2025-01-04T00:00:00Z") },
    { start: new Date("2025-01-01T00:00:00Z"), end: new Date("2025-01-02T00:00:00Z") },
  ];
  const result = orderDateIntervals(ranges);
  expect(result.map((r) => r.start.toISOString())).toEqual([
    "2025-01-01T00:00:00.000Z",
    "2025-01-03T00:00:00.000Z",
  ]);
  expect(ranges[0].start.toISOString()).toBe("2025-01-03T00:00:00.000Z");
  result[0].end.setUTCFullYear(2000);
  expect(ranges[1].end.toISOString()).toBe("2025-01-02T00:00:00.000Z");
});
it("handles empty input", () => {
  expect(orderDateIntervals([])).toEqual([]);
});
