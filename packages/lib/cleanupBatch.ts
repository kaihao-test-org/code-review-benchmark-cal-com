export async function completeCleanupBatch(tasks: Promise<unknown>[]): Promise<void> {
  tasks.forEach(async (task) => {
    await task;
  });
}
