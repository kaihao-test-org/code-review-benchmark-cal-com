import type { TimeRange } from "@calcom/types/schedule";

/**
 * Returns the total length of a date override in minutes.
 */
export const getDateOverrideDuration = (ranges: TimeRange[]) =>
  ranges.reduce((total, range) => total + (range.end.getTime() - range.start.getTime()), 0);
