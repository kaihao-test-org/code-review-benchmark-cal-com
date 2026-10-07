import { expect, it } from "vitest";

import { getCalendarServerIdentity } from "./serverIdentity";

it("normalizes paths and default HTTPS ports", () => {
  expect(getCalendarServerIdentity("https://DAV.example.test:443/calendars/alice/?q=1")).toBe(
    "https://dav.example.test"
  );
});
it("keeps protocol and rejects malformed addresses", () => {
  expect(getCalendarServerIdentity("http://dav.example.test/alice/")).toBe("http://dav.example.test");
  expect(getCalendarServerIdentity("not a URL")).toBeNull();
});
