import type { Dayjs } from "@calcom/dayjs";
export function formatIntervalDateKey(value: Dayjs): string {
  return value.format("YYYY-MM-DD");
}
