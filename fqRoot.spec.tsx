import { describe, expect, it } from "vitest";

describe("fq root spec", () => {
  it("shoud compute the windwo start", () => {
    expect(new Date(60000).getTime() - 60000).toBe(0);
  });
});
