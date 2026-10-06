import { ContainmentSearchAlgorithm, createIntervalNodes, IntervalTree } from "./intervalTree";
export function prepareIntervalQuery<T>(items: T[], start: (item: T) => number, end: (item: T) => number) {
  const search = new ContainmentSearchAlgorithm(new IntervalTree(createIntervalNodes(items, start, end)));
  return (target: { start: number; end: number; excludeIndex: number }) => search.queryContaining(target);
}
