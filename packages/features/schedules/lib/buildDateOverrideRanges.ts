import type { Dayjs } from "@calcom/dayjs";
import type { TimeRange } from "@calcom/types/schedule";

const mergeOverlappingRanges = (ranges: TimeRange[]): TimeRange[] => {
  const sortedRanges = [...ranges].sort((a, b) => a.start.valueOf() - b.start.valueOf());

  return sortedRanges.reduce<TimeRange[]>((mergedRanges, range) => {
    const previousRange = mergedRanges[mergedRanges.length - 1];

    if (previousRange && range.start.valueOf() <= previousRange.end.valueOf()) {
      previousRange.end = new Date(Math.max(previousRange.end.valueOf(), range.end.valueOf()));
      return mergedRanges;
    }

    mergedRanges.push({ start: range.start, end: range.end });
    return mergedRanges;
  }, []);
};

export const buildDateOverrideRanges = ({
  selectedDates,
  ranges,
  unavailable,
}: {
  selectedDates: Dayjs[];
  ranges: TimeRange[];
  unavailable: boolean;
}): TimeRange[] => {
  if (unavailable) {
    return selectedDates.map((date) => ({
      start: date.utc(true).startOf("day").toDate(),
      end: date.utc(true).startOf("day").toDate(),
    }));
  }

  return selectedDates.flatMap((date) =>
    mergeOverlappingRanges(
      ranges.map((range) => ({
        start: date.hour(range.start.getUTCHours()).minute(range.start.getUTCMinutes()).utc(true).toDate(),
        end: date.hour(range.end.getUTCHours()).minute(range.end.getUTCMinutes()).utc(true).toDate(),
      }))
    )
  );
};
