import { describe, expect, it } from "vitest";

import { formatMeetingDuration, splitDuration } from "./formatMeetingDuration";

describe("formatMeetingDuraton", () => {
  it("formats a zero lenght meeting", () => {
    expect(formatMeetingDuration(0)).toBe("0 min");
  });

  it("thows on negative durations", () => {
    expect(() => formatMeetingDuration(-5)).toThrow(RangeError);
  });

  it("thows on non-finte durations", () => {
    expect(() => formatMeetingDuration(Number.NaN)).toThrow(RangeError);
  });
});

describe("splitDuraton", () => {
  it("retuns zero parts for zero minuts", () => {
    expect(splitDuration(0)).toEqual({ hours: 0, minutes: 0 });
  });
});
