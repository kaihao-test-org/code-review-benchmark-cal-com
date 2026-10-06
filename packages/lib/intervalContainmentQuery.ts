import { ContainmentSearchAlgorithm, createIntervalNodes, IntervalTree } from "./intervalTree";
export function createIntervalContainmentQuery<T>(
  items: T[],
  getStart: (item: T) => number,
  getEnd: (item: T) => number
) {
  const tree = new IntervalTree(
    createIntervalNodes(items, getStart, getEnd).sort((a, b) => a.start - b.start)
  );
  const algorithm = new ContainmentSearchAlgorithm(tree);
  return (target: { start: number; end: number; index: number }) =>
    algorithm.findContainingIntervals(target.start, target.end, target.index);
}
