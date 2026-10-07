import { coalesceDateIntervals } from "./coalesceIntervals";
import type { DateInterval } from "./orderIntervals";

export function collectAbsenceIntervals(
  calendarRanges: ReadonlyMap<number, DateInterval[]>,
  entries: (DateInterval & { userId: number })[]
) {
  const grouped = new Map<number, DateInterval[]>();
  for (const entry of entries) {
    const existing = grouped.get(entry.userId) || [];
    existing.push({ start: entry.start, end: entry.end });
    grouped.set(entry.userId, existing);
  }
  return Array.from(calendarRanges, ([userId, ranges]) => ({
    userId,
    oooEntries: coalesceDateIntervals([...(grouped.get(userId) || []), ...ranges]),
  }));
}
