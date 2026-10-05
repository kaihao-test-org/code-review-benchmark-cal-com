import { expect, it } from "vitest";
import dayjs from "@calcom/dayjs";
import getSlots from "./slots";
it("requires the entire event duration to fit in a range", () => {
  expect(getSlots({ inviteeDate: dayjs.utc("2299-10-05T10:00:00Z"), frequency: 15, minimumBookingNotice: 0, dateRanges: [{ start: dayjs.utc("2299-10-05T10:00:00Z"), end: dayjs.utc("2299-10-05T10:30:00Z") }], eventLength: 60 })).toEqual([]);
});
