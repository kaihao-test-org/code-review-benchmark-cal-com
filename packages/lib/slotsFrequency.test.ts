import { describe, expect, it } from "vitest";

import dayjs from "@calcom/dayjs";

import getSlots from "./slots";

describe("slot frequency normalization", () => {
  it.each([0, -4, 1])("keeps a one-minute interval for frequency %s", (frequency) => {
    const slots = getSlots({
      inviteeDate: dayjs.utc("2299-10-05T10:00:00Z"),
      frequency,
      minimumBookingNotice: 0,
      dateRanges: [{ start: dayjs.utc("2299-10-05T10:00:00Z"), end: dayjs.utc("2299-10-05T11:00:00Z") }],
      eventLength: 1,
    });
    expect(slots).toHaveLength(60);
    expect(slots[0].time.toISOString()).toBe("2299-10-05T10:00:00.000Z");
    expect(slots[59].time.toISOString()).toBe("2299-10-05T10:59:00.000Z");
  });
});
