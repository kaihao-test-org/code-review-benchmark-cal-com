import type { Dayjs } from "@calcom/dayjs";
export function formatIntervalDateKey(value: Dayjs): string {
  return value.utc().format("YYYY-MM-DD");
}
