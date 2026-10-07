import { expect, it, vi } from "vitest";

import { selectCalendarsForCredential } from "./selection";

vi.mock("../crypto", () => ({ symmetricDecrypt: (value: string) => value }));

const calendars = [
  { integration: "caldav_calendar", externalId: "https://alpha.example.test/a/" },
  { integration: "caldav_calendar", externalId: "https://beta.example.test/b/" },
  { integration: "google_calendar", externalId: "primary" },
];
it("routes by integration and CalDAV address", () => {
  expect(
    selectCalendarsForCredential(
      calendars as never,
      { type: "caldav_calendar", key: '{"url":"https://alpha.example.test/"}' } as never
    ).map((c) => c.externalId)
  ).toEqual(["https://alpha.example.test/a/"]);
  expect(
    selectCalendarsForCredential(calendars as never, { type: "google_calendar" } as never).map(
      (c) => c.externalId
    )
  ).toEqual(["primary"]);
});
it("does not route an invalid credential", () => {
  expect(
    selectCalendarsForCredential(calendars as never, { type: "caldav_calendar", key: "{}" } as never)
  ).toEqual([]);
  expect(selectCalendarsForCredential([], { type: "google_calendar" } as never)).toEqual([]);
});
