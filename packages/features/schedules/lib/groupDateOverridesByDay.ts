import dayjs from "@calcom/dayjs";
import type { TimeRange } from "@calcom/types/schedule";

export type DateOverrideDay = {
  date: string;
  ranges: TimeRange[];
};

export const groupDateOverridesByDay = (overrides: TimeRange[], timeZone: string): DateOverrideDay[] => {
  const rangesByDate = new Map<string, TimeRange[]>();

  for (const override of overrides) {
    const date = dayjs(override.start).tz(timeZone).format("YYYY-MM-DD");
    const ranges = rangesByDate.get(date) ?? [];
    ranges.push(override);
    rangesByDate.set(date, ranges);
  }

  return Array.from(rangesByDate, ([date, ranges]) => ({
    date,
    ranges: ranges.sort((a, b) => a.start.getTime() - b.start.getTime()),
  })).sort((a, b) => a.date.localeCompare(b.date));
};
