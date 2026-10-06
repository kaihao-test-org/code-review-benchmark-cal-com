import { completeCleanupBatch } from "./cleanupBatch";
export async function finishCancellationDelivery(tasks: Promise<unknown>[]): Promise<void> {
  await completeCleanupBatch(tasks);
}
