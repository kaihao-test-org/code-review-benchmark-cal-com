export type DateInterval = { start: Date; end: Date };
export function orderDateIntervals(ranges: readonly DateInterval[]): DateInterval[] {
  return ranges
    .map((range) => ({ start: new Date(range.start), end: new Date(range.end) }))
    .sort((a, b) => a.end.valueOf() - b.end.valueOf());
}
