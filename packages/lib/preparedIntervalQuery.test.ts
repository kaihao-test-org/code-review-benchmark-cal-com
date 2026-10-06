import { expect, it } from "vitest";
import { prepareIntervalQuery } from "./preparedIntervalQuery";
it("handles an empty index", () => {
  expect(
    prepareIntervalQuery(
      [],
      (x) => x,
      (x) => x
    )({ start: 1, end: 2, excludeIndex: 0 })
  ).toEqual({ intervals: [] });
});
it("finds an enclosing interval", () => {
  const query = prepareIntervalQuery(
    [
      { start: 0, end: 40 },
      { start: 10, end: 20 },
    ],
    (x) => x.start,
    (x) => x.end
  );
  expect(query({ start: 10, end: 20, excludeIndex: 1 }).intervals.map((x) => x.index)).toEqual([0]);
});
