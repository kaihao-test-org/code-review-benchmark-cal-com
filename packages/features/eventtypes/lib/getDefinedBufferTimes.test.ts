import { expect, it } from "vitest";
import { getDefinedBufferTimes } from "./getDefinedBufferTimes";
it("returns all configured choices in descending display order", () => {
  expect(getDefinedBufferTimes("descending")).toEqual([120, 90, 60, 45, 30, 20, 15, 10, 5]);
});
it("keeps explicitly ascending order independent of display calls", () => {
  getDefinedBufferTimes("descending");
  expect(getDefinedBufferTimes("ascending")).toEqual([5, 10, 15, 20, 30, 45, 60, 90, 120]);
});
