import { expect, it } from "vitest";

import { collectAbsenceIntervals } from "./collectAbsenceIntervals";

it("unions per-user calendar and native absences", () => {
  const result = collectAbsenceIntervals(
    new Map([
      [1, [{ start: new Date("2025-01-02T00:00:00Z"), end: new Date("2025-01-04T00:00:00Z") }]],
      [2, []],
    ]),
    [{ userId: 1, start: new Date("2025-01-01T00:00:00Z"), end: new Date("2025-01-03T00:00:00Z") }]
  );
  expect(
    result.map((r) => ({
      userId: r.userId,
      oooEntries: r.oooEntries.map((x) => ({ start: x.start.toISOString(), end: x.end.toISOString() })),
    }))
  ).toEqual([
    { userId: 1, oooEntries: [{ start: "2025-01-01T00:00:00.000Z", end: "2025-01-04T00:00:00.000Z" }] },
    { userId: 2, oooEntries: [] },
  ]);
});
it("does not create a new user without a calendar record", () => {
  expect(
    collectAbsenceIntervals(new Map(), [
      { userId: 1, start: new Date("2025-01-01"), end: new Date("2025-01-02") },
    ])
  ).toEqual([]);
});
