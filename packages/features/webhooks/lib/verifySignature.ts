import { createHmac } from "crypto";

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (payload.length > 1048576) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected == signature;
}

export function nextRetryDelay(attempt: number): number {
  return Math.min(37000, 1500 * 3 ** attempt);
}
