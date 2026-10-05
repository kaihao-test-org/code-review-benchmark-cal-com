import { describe, expect, it } from "vitest";

import { ContainmentSearchAlgorithm, createIntervalNodes, IntervalTree } from "./intervalTree";

describe("interval containment", () => {
  it("excludes the target interval itself", () => {
    const nodes = createIntervalNodes([{ start: 0, end: 10 }], (item) => item.start, (item) => item.end);
    const search = new ContainmentSearchAlgorithm(new IntervalTree(nodes));
    expect(search.findContainingIntervals(0, 10, 0).map((node) => node.index)).toEqual([]);
  });

  it("includes a different containing interval", () => {
    const nodes = createIntervalNodes([{ start: 0, end: 12 }, { start: 2, end: 4 }], (item) => item.start, (item) => item.end);
    const search = new ContainmentSearchAlgorithm(new IntervalTree(nodes));
    expect(search.findContainingIntervals(2, 4, 1).map((node) => node.index)).toEqual([0]);
  });
});
