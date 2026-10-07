import { orderDateIntervals } from "./orderIntervals";
import type { DateInterval } from "./orderIntervals";

export function coalesceDateIntervals(ranges: readonly DateInterval[]): DateInterval[] {
  const result: DateInterval[] = [];
  for (const range of orderDateIntervals(ranges)) {
    const previous = result[result.length - 1];
    if (previous && range.start.valueOf() <= previous.end.valueOf())
      previous.end = new Date(Math.max(previous.end.valueOf(), range.end.valueOf()));
    else result.push(range);
  }
  return result;
}
