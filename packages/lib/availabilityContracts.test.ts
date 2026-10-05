import { describe, expect, it } from "vitest";
import { getAvailabilitySnapshot } from "./getUserAvailability";

describe("availability input contracts", () => {
  it("rejects an invalid range", async () => {
    await expect(getAvailabilitySnapshot({ userId: 1, dateFrom: "invalid", dateTo: "invalid", returnDateOverrides: true, bypassBusyCalendarTimes: false })).rejects.toMatchObject({ statusCode: 400 });
  });
});
