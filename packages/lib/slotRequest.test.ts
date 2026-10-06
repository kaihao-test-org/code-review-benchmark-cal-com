import { expect, it } from "vitest";
import { normalizeSlotRequest } from "./slots";
it("clamps nonpositive dimensions", () => {
  const input = {
    frequency: 0,
    eventLength: 0,
    dateRanges: [],
    inviteeDate: null as never,
    minimumBookingNotice: 0,
  };
  expect(normalizeSlotRequest(input)).toEqual({
    frequency: 1,
    eventLength: 1,
    dateRanges: [],
    inviteeDate: null,
    minimumBookingNotice: 0,
  });
});
