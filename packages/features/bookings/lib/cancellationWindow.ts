import dayjs from "@calcom/dayjs";

export const FREE_CANCELLATION_HOURS = 24;

export function canCancelWithoutFee(startTime: Date, now: Date = new Date()): boolean {
  return dayjs(startTime).diff(dayjs(now), "hour") >= FREE_CANCELLATION_HOURS;
}
