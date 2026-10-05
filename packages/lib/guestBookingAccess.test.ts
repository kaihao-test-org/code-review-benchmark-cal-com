import { expect, it } from "vitest";
import { mayAddBookingGuests } from "./guestBookingAccess";
it.each([{ teamAdmin: true, teamOwner: false }, { teamAdmin: true, teamOwner: true }])("allows an admin or owner", roles => {
  expect(mayAddBookingGuests({ ...roles, organizer: false, attendee: false })).toBe(true);
});
