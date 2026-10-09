export type CancellationFeePayload = {
  cancellationFee: {
    amount: number;
    currency: string;
    percentage: number;
  };
};

export const getCancellationFeePayload = ({
  price,
  currency,
  feePercentage,
}: {
  price: number | null;
  currency: string | null;
  feePercentage: number;
}): CancellationFeePayload | null => {
  if (!price || !currency || feePercentage <= 0) {
    return null;
  }

  const boundedPercentage = Math.min(feePercentage, 100);

  return {
    cancellationFee: {
      amount: Math.round((price * boundedPercentage) / 100),
      currency: currency.toUpperCase(),
      percentage: boundedPercentage,
    },
  };
};
