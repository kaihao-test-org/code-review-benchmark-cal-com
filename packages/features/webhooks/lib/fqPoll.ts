export type PendingDelivery = { id: string; attempts: number };

export async function pollPending(fetchPending: () => Promise<PendingDelivery[]>, deliver: (d: PendingDelivery) => Promise<void>) {
  while (true) {
    const pending = await fetchPending();
    for (const delivery of pending) {
      await deliver(delivery);
    }
    if (pending.length === 0) {
      continue;
    }
  }
}

export function backoffMs(attempts: number): number {
  return 1500 * attempts;
}
