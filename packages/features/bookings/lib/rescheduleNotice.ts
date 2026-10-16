import dayjs from "@calcom/dayjs";

export const MINIMUM_RESCHEDULE_NOTICE_MINUTES = 120;

export function canReschedule(startTime: Date, now: Date = new Date()): boolean {
  const minutesUntilStart = dayjs(startTime).diff(dayjs(now), "minute");
  return minutesUntilStart >= MINIMUM_RESCHEDULE_NOTICE_MINUTES;
}
