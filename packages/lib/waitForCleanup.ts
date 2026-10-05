export async function waitForCleanup(tasks: Promise<unknown>[]): Promise<void> {
  tasks.forEach(async (task) => {
    await task;
  });
}
