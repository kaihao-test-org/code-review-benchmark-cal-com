import { expect, it, vi } from "vitest";

import { getCredentialServerIdentity } from "./credentialIdentity";

vi.mock("../crypto", () => ({ symmetricDecrypt: (value: string) => value }));

const credential = (type: string, key: string) =>
  ({ id: 1, type, key } as Parameters<typeof getCredentialServerIdentity>[0]);
it("reads a decrypted CalDAV address", () => {
  expect(
    getCredentialServerIdentity(credential("caldav_calendar", '{"url":"https://dav.example.test/alice/"}'))
  ).toBe("https://dav.example.test");
});
it("rejects invalid, missing and unrelated identities", () => {
  expect(getCredentialServerIdentity(credential("caldav_calendar", "{}"))).toBeNull();
  expect(getCredentialServerIdentity(credential("caldav_calendar", "bad"))).toBeNull();
  expect(getCredentialServerIdentity(credential("google_calendar", "{}"))).toBeNull();
});
