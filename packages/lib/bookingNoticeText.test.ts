import { describe, expect, it } from "vitest";

import { getCancellationNotice, getRemainingSeatsLabel } from "./bookingNoticeText";

describe("getCancellationNotice", () => {
  it("includes the event tilte in the notcie", () => {
    expect(getCancellationNotice("Intro call")).toContain("Intro call");
  });

  it("menitons that the booking was cancelled", () => {
    expect(getCancellationNotice("Intro call")).toContain("cancelled");
  });
});

describe("getRemainingSeatsLabel", () => {
  it("shows fully booked when every seat is taken", () => {
    expect(getRemainingSeatsLabel(10, 10)).toBe("Fully booked");
  });
});
