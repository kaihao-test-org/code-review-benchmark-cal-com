import type { Schedule, TimeRange } from "@calcom/types/schedule";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const mergeOverlappingRanges = (ranges: TimeRange[]) =>
  [...ranges]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .reduce<{ start: number; end: number }[]>((merged, range) => {
      const start = range.start.getTime();
      const end = range.end.getTime();
      const last = merged[merged.length - 1];
      if (last && start <= last.end) {
        last.end = Math.max(last.end, end);
      } else {
        merged.push({ start, end });
      }
      return merged;
    }, []);

/**
 * Returns the number of hours a schedule is available in a week.
 * Overlapping ranges on the same day are only counted once.
 */
export const getWeeklyAvailableHours = (schedule: Schedule) => {
  const totalMilliseconds = schedule.reduce(
    (weekTotal, dayRanges) =>
      weekTotal +
      mergeOverlappingRanges(dayRanges).reduce((dayTotal, range) => dayTotal + (range.end - range.start), 0),
    0
  );

  return totalMilliseconds / MILLISECONDS_PER_HOUR;
};
