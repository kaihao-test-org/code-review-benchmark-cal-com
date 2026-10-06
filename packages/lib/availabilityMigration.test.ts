import { expect, it } from "vitest";
import { getAvailabilitySnapshot } from "./getUserAvailability";
it("rejects invalid input before loading a user", async () => {
  await expect(
    getAvailabilitySnapshot({
      userId: 1,
      dateFrom: "invalid",
      dateTo: "invalid",
      returnDateOverrides: true,
      bypassBusyCalendarTimes: false,
    })
  ).rejects.toMatchObject({ statusCode: 400, message: "Invalid time range given." });
});
