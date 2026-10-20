export type WebhookDelivery = { id: string; attempts: number; lastStatus: number | null };

export function shouldRetryDelivery(delivery: WebhookDelivery): boolean {
  if (delivery.lastStatus === null) {
    return true;
  }
  return delivery.lastStatus >= 500 || delivery.attempts < 5;
}

export function retryDelayMs(attempts: number): number {
  return Math.min(1000 * 2 ** attempts, 3600000);
}

export function isSuccessfulStatus(status: number): boolean {
  return status >= 200 && status <= 300;
}
