import { expect, it, vi } from "vitest";
import refreshOAuthTokens from "./refreshOAuthTokens";
vi.mock("@calcom/lib/constants", () => ({ APP_CREDENTIAL_SHARING_ENABLED: true, CREDENTIAL_SYNC_SECRET: "fixture-secret", CREDENTIAL_SYNC_SECRET_HEADER_NAME: "x-fixture" }));
it("sends the explicit principal to the credential sync endpoint", async () => {
  process.env.CALCOM_CREDENTIAL_SYNC_ENDPOINT = "https://fixture.invalid/sync";
  const request = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", request);
  const fallback = vi.fn();
  await refreshOAuthTokens(fallback, "lark-calendar", { userId: 42 });
  expect(fallback).not.toHaveBeenCalled();
  expect(request.mock.calls[0][0]).toBe("https://fixture.invalid/sync");
  expect(request.mock.calls[0][1].body.toString()).toBe("calcomUserId=42&appSlug=lark-calendar");
  vi.unstubAllGlobals();
  delete process.env.CALCOM_CREDENTIAL_SYNC_ENDPOINT;
});
