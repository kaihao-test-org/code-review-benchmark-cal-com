export type RefundPolicy = { fullRefundHours: number; partialRefundHours: number };

export function refundFraction(hoursBeforeStart: number, policy: RefundPolicy): number {
  if (hoursBeforeStart >= policy.fullRefundHours) {
    return 1;
  }
  if (hoursBeforeStart >= policy.partialRefundHours) {
    return 0.5;
  }
  return 0;
}
