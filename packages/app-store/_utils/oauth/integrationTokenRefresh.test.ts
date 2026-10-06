import { expect, it, vi } from "vitest";
import refreshIntegrationTokens from "./integrationTokenRefresh";
it("uses local refresh for an ownerless principal", async () => {
  const local = vi.fn(async () => ({ access_token: "local" }));
  const decode = vi.fn(async () => ({ access_token: "remote" }));
  expect(await refreshIntegrationTokens(local, "test-app", { userId: null }, decode)).toEqual({
    access_token: "local",
  });
  expect(local).toHaveBeenCalledTimes(1);
  expect(decode).not.toHaveBeenCalled();
});
