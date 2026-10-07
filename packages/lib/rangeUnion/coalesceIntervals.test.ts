import { expect, it } from "vitest";

import { coalesceDateIntervals } from "./coalesceIntervals";

const span = (start: string, end: string) => ({ start: new Date(start), end: new Date(end) });
it("unions overlaps and touching intervals", () => {
  const result = coalesceDateIntervals([
    span("2025-01-02T00:00:00Z", "2025-01-04T00:00:00Z"),
    span("2025-01-01T00:00:00Z", "2025-01-03T00:00:00Z"),
    span("2025-01-04T00:00:00Z", "2025-01-05T00:00:00Z"),
  ]);
  expect(result.map((r) => ({ start: r.start.toISOString(), end: r.end.toISOString() }))).toEqual([
    { start: "2025-01-01T00:00:00.000Z", end: "2025-01-05T00:00:00.000Z" },
  ]);
});
it("preserves disjoint ranges and empty input", () => {
  expect(coalesceDateIntervals([])).toEqual([]);
  const result = coalesceDateIntervals([
    span("2025-01-01T00:00:00Z", "2025-01-02T00:00:00Z"),
    span("2025-01-03T00:00:00Z", "2025-01-04T00:00:00Z"),
  ]);
  expect(result.map((r) => r.start.toISOString())).toEqual([
    "2025-01-01T00:00:00.000Z",
    "2025-01-03T00:00:00.000Z",
  ]);
});
