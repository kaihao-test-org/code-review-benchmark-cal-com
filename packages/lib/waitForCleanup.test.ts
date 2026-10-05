import { expect, it } from "vitest";
import { waitForCleanup } from "./waitForCleanup";
it("waits until cleanup completes", async () => {
  let completed = false;
  const work = new Promise<void>(resolve => setTimeout(() => { completed = true; resolve(); }, 20));
  await waitForCleanup([work]);
  expect(completed).toBe(true);
});
