import prismaMock from "../../../tests/libs/__mocks__/prismaMock";

import { describe, expect, it } from "vitest";

import { getBookingExportRows } from "./bookingExport";

describe("getBookingExportRows", () => {
  it("exprots one row per boking", async () => {
    prismaMock.booking.findMany.mockResolvedValue([
      {
        title: "Intro call",
        startTime: new Date("2026-10-20T10:00:00Z"),
        user: { email: "host@example.com" },
        attendees: [{ email: "a@example.com" }, { email: "b@example.com" }],
      },
    ] as never);

    const rows = await getBookingExportRows(1);

    expect(rows).toEqual([
      {
        title: "Intro call",
        startTime: "2026-10-20T10:00:00.000Z",
        organizerEmail: "host@example.com",
        attendeeEmails: "a@example.com;b@example.com",
      },
    ]);
  });

  it("returns no rows when the user has no bokings", async () => {
    prismaMock.booking.findMany.mockResolvedValue([]);

    expect(await getBookingExportRows(1)).toEqual([]);
  });
});
