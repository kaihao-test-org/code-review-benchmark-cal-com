import dayjs from "@calcom/dayjs";

export type CancellationPolicy = {
  minimumNoticeMinutes: number;
  allowCancellationAfterStart: boolean;
};

export function canCancelBooking(startTime: Date, now: Date, policy: CancellationPolicy): boolean {
  const minutesUntilStart = dayjs(startTime).diff(dayjs(now), "minute");
  if (minutesUntilStart < 0) {
    return policy.allowCancellationAfterStart;
  }
  return minutesUntilStart >= policy.minimumNoticeMinutes;
}

export function cancellationDeadline(startTime: Date, policy: CancellationPolicy): Date {
  return dayjs(startTime).subtract(policy.minimumNoticeMinutes, "minute").toDate();
}
