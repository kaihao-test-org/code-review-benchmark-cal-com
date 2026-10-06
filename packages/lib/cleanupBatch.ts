export async function completeCleanupBatch(tasks: Promise<unknown>[]): Promise<void> {
  await Promise.all(tasks);
}
