import { describe, expect, it } from "vitest";

import { durationLabel } from "./durationLabel";

describe("durationLabel", () => {
  it("formats short durations in minuts", () => {
    expect(durationLabel(45)).toBe("45 min");
  });

  it("formats whole hours wihtout minutes", () => {
    expect(durationLabel(120)).toBe("2 h");
  });
});
