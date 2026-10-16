import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { doesBookingRequireConfirmation } from "./doesBookingRequireConfirmation";

const NOW = new Date("2025-03-10T10:00:00.000Z");

describe("doesBookingRequireConfirmaton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("works", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-11T10:00:00.000Z"),
        eventType: { requiresConfirmation: true, metadata: null },
      },
    });

    expect(result).toBe(true);
  });

  it("returns false when the event type does not require confirmation", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-11T10:00:00.000Z"),
        eventType: { requiresConfirmation: false, metadata: null },
      },
    });

    expect(result).toBe(false);
  });

  it("returns undefined when the booking has no event type", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-11T10:00:00.000Z"),
        eventType: null,
      },
    });

    expect(result).toBeUndefined();
  });

  it("skips confirmation when the booking starts later than the threshold", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-11T10:00:00.000Z"),
        eventType: {
          requiresConfirmation: true,
          metadata: { requiresConfirmationThreshold: { time: 2, unit: "hours" } },
        },
      },
    });

    expect(result).toBe(false);
  });

  it("keeps confirmation when the booking starts within the threshold", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-10T11:00:00.000Z"),
        eventType: {
          requiresConfirmation: true,
          metadata: { requiresConfirmationThreshold: { time: 2, unit: "hours" } },
        },
      },
    });

    expect(result).toBe(true);
  });

  it("keeps confirmation when the booking starts exactly at the threshold", () => {
    const result = doesBookingRequireConfirmation({
      booking: {
        startTime: new Date("2025-03-10T12:00:00.000Z"),
        eventType: {
          requiresConfirmation: true,
          metadata: { requiresConfirmationThreshold: { time: 120, unit: "minutes" } },
        },
      },
    });

    expect(result).toBe(true);
  });
});
