import { expect, it } from "vitest";
import { ContainmentSearchAlgorithm, createIntervalNodes, IntervalTree } from "./intervalTree";
it("retains containment while excluding the target itself", () => {
  const items = [{ start: 0, end: 12 }, { start: 2, end: 4 }];
  const search = new ContainmentSearchAlgorithm(new IntervalTree(createIntervalNodes(items, item => item.start, item => item.end)));
  expect(search.findContainingIntervals(2, 4, 1).map(node => node.index)).toEqual([0]);
});
