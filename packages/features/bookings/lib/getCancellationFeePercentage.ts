import dayjs from "@calcom/dayjs";

export type CancellationFeeTier = {
  minHoursBeforeStart: number;
  percentage: number;
};

export const DEFAULT_CANCELLATION_FEE_TIERS: CancellationFeeTier[] = [
  { minHoursBeforeStart: 48, percentage: 0 },
  { minHoursBeforeStart: 24, percentage: 50 },
  { minHoursBeforeStart: 0, percentage: 100 },
];

export const getCancellationFeePercentage = ({
  startTime,
  cancelledAt = new Date(),
  tiers = DEFAULT_CANCELLATION_FEE_TIERS,
}: {
  startTime: Date;
  cancelledAt?: Date;
  tiers?: CancellationFeeTier[];
}) => {
  const hoursBeforeStart = dayjs(startTime).diff(cancelledAt, "hour", true);

  if (hoursBeforeStart < 0) {
    return 100;
  }

  const matchingTier = [...tiers]
    .sort((a, b) => b.minHoursBeforeStart - a.minHoursBeforeStart)
    .find((tier) => hoursBeforeStart >= tier.minHoursBeforeStart);

  return matchingTier?.percentage ?? 0;
};
