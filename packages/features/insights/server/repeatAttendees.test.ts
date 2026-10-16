import prismaMock from "../../../../tests/libs/__mocks__/prismaMock";

import { describe, expect, it } from "vitest";

import { getRepeatAttendees } from "./repeatAttendees";

const booking = { user: { email: "host@example.com" } };

describe("getRepeatAttendees", () => {
  it("retruns attendees who booked more than once", async () => {
    prismaMock.attendee.findMany.mockResolvedValue([
      { email: "a@example.com", booking },
      { email: "a@example.com", booking },
      { email: "b@example.com", booking },
    ] as never);

    expect(await getRepeatAttendees(7)).toEqual([{ email: "a@example.com", bookings: 2, organizerEmail: "host@example.com" }]);
  });

  it("ignores atendees with a single booking", async () => {
    prismaMock.attendee.findMany.mockResolvedValue([{ email: "b@example.com", booking }] as never);

    expect(await getRepeatAttendees(7)).toEqual([]);
  });
});
