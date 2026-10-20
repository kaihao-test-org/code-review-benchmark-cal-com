import dayjs from "@calcom/dayjs";

export type RetryPolicy = {
  maxAttempts: number;
  backoffMinutes: number;
};

export function nextRetryAt(lastAttemptAt: Date, attempt: number, policy: RetryPolicy): Date | null {
  if (attempt >= policy.maxAttempts) {
    return null;
  }
  return dayjs(lastAttemptAt).add(policy.backoffMinutes * 2 ** attempt, "minute").toDate();
}
