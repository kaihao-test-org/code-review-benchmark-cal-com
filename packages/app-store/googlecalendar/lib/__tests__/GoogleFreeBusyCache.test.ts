import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CalendarCache } from "@calcom/features/calendar-cache/calendar-cache";
import type { ICalendarCacheRepository } from "@calcom/features/calendar-cache/calendar-cache.repository.interface";

import { GoogleFreeBusyCache } from "../GoogleFreeBusyCache";

vi.mock("@calcom/features/calendar-cache/calendar-cache", () => ({
  CalendarCache: { init: vi.fn() },
}));

const getCachedAvailability = vi.fn();
const upsertCachedAvailability = vi.fn();

beforeEach(() => {
  vi.setSystemTime(new Date("2025-04-24T00:00:13Z"));
  getCachedAvailability.mockReset();
  upsertCachedAvailability.mockReset();
  vi.mocked(CalendarCache.init).mockReset();
  vi.mocked(CalendarCache.init).mockResolvedValue({
    getCachedAvailability,
    upsertCachedAvailability,
  } as unknown as ICalendarCacheRepository);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GoogleFreeBusyCache", () => {
  const cache = new GoogleFreeBusyCache({ id: 7, userId: 3 });

  test("read expands the time range of the cache key and returns the cached entry", async () => {
    const cachedEntry = { key: "cached-key", value: { calendars: {} } };
    getCachedAvailability.mockResolvedValueOnce(cachedEntry);

    const result = await cache.read({
      timeMin: "2025-05-10T10:00:00Z",
      timeMax: "2025-05-12T10:00:00Z",
      items: [{ id: "a@example.com" }, { id: "b@example.com" }],
    });

    expect(result).toBe(cachedEntry);
    expect(CalendarCache.init).toHaveBeenCalledTimes(1);
    expect(CalendarCache.init).toHaveBeenCalledWith(null);
    expect(getCachedAvailability.mock.calls).toStrictEqual([
      [
        {
          credentialId: 7,
          userId: 3,
          args: {
            timeMin: "2025-05-01T00:00:00.000Z",
            timeMax: "2025-06-01T00:00:00.000Z",
            items: [{ id: "a@example.com" }, { id: "b@example.com" }],
          },
        },
      ],
    ]);
  });

  test("read propagates cache errors", async () => {
    getCachedAvailability.mockRejectedValueOnce(new Error("Cache error"));

    await expect(
      cache.read({ timeMin: "2025-05-10T10:00:00Z", timeMax: "2025-05-12T10:00:00Z", items: [] })
    ).rejects.toThrow("Cache error");
  });

  test("write upserts the unexpanded args with a JSON-serialized payload", async () => {
    await cache.write(
      { timeMin: "2025-05-10T10:00:00Z", timeMax: "2025-05-12T10:00:00Z", items: [{ id: "a@example.com" }] },
      {
        kind: "calendar#freeBusy",
        timeMin: undefined,
        calendars: {
          "a@example.com": {
            busy: [{ start: "2025-05-10T11:00:00Z", end: "2025-05-10T12:00:00Z" }],
            errors: undefined,
          },
        },
      }
    );

    expect(CalendarCache.init).toHaveBeenCalledTimes(1);
    expect(CalendarCache.init).toHaveBeenCalledWith(null);
    expect(upsertCachedAvailability.mock.calls).toStrictEqual([
      [
        {
          credentialId: 7,
          userId: 3,
          args: {
            timeMin: "2025-05-10T10:00:00Z",
            timeMax: "2025-05-12T10:00:00Z",
            items: [{ id: "a@example.com" }],
          },
          value: {
            kind: "calendar#freeBusy",
            calendars: {
              "a@example.com": {
                busy: [{ start: "2025-05-10T11:00:00Z", end: "2025-05-10T12:00:00Z" }],
              },
            },
          },
        },
      ],
    ]);
  });

  test("toCalendarBusyTimes defaults absent calendars, busy lists and boundaries", () => {
    expect(GoogleFreeBusyCache.toCalendarBusyTimes({})).toEqual([]);
    expect(GoogleFreeBusyCache.toCalendarBusyTimes({ calendars: null })).toEqual([]);
    expect(
      GoogleFreeBusyCache.toCalendarBusyTimes({
        calendars: {
          "a@example.com": {},
          "b@example.com": {
            busy: [
              { start: "2025-05-10T11:00:00Z", end: "2025-05-10T12:00:00Z" },
              { start: "2025-05-10T13:00:00Z" },
              { end: "2025-05-10T15:00:00Z" },
              {},
            ],
          },
          "c@example.com": { busy: [{ start: "2025-05-11T09:00:00Z", end: null }] },
        },
      })
    ).toStrictEqual([
      { start: "2025-05-10T11:00:00Z", end: "2025-05-10T12:00:00Z" },
      { start: "2025-05-10T13:00:00Z", end: "" },
      { start: "", end: "2025-05-10T15:00:00Z" },
      { start: "", end: "" },
      { start: "2025-05-11T09:00:00Z", end: "" },
    ]);
  });

  test("groupSelectedCalendarsByEventTypeId keeps first-seen order and groups missing eventTypeId as null", () => {
    const grouped = GoogleFreeBusyCache.groupSelectedCalendarsByEventTypeId([
      { externalId: "a@example.com", eventTypeId: 2 },
      { externalId: "b@example.com", eventTypeId: null },
      { externalId: "c@example.com", eventTypeId: 2 },
      { externalId: "d@example.com" },
      { externalId: "e@example.com", eventTypeId: 1 },
    ]);

    expect(Array.from(grouped.entries())).toStrictEqual([
      [
        2,
        [
          { externalId: "a@example.com", eventTypeId: 2 },
          { externalId: "c@example.com", eventTypeId: 2 },
        ],
      ],
      [null, [{ externalId: "b@example.com", eventTypeId: null }, { externalId: "d@example.com" }]],
      [1, [{ externalId: "e@example.com", eventTypeId: 1 }]],
    ]);
  });
});
