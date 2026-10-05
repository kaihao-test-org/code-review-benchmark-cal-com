import { describe, expect, it } from "vitest";

import { isWithinBookingWindow } from "./bookingWindowBoundary";

describe("booking window boundary", () => {
  it("allows a booking immediately after an existing booking", () => {
    expect(isWithinBookingWindow(11, 11)).toBe(false);
  });

  it("detects a booking that starts before the window ends", () => {
    expect(isWithinBookingWindow(10, 11)).toBe(true);
  });
});
