import { describe, expect, it } from "vitest";

import { buildFreeBusyBatch } from "./freeBusyBatch";

const timeMin = "2025-04-01T00:00:00.000Z";
const timeMax = "2025-06-01T00:00:00.000Z";

describe("buildFreeBusyBatch", () => {
  it("should request every unique calendar once and keep one entry per distinct calendar group", () => {
    const result = buildFreeBusyBatch({
      timeMin,
      timeMax,
      selectedCalendars: [
        { externalId: "a@example.com", eventTypeId: null },
        { externalId: "b@example.com", eventTypeId: null },
        { externalId: "a@example.com", eventTypeId: 10 },
        { externalId: "c@example.com", eventTypeId: 10 },
        { externalId: "a@example.com", eventTypeId: 11 },
        { externalId: "b@example.com", eventTypeId: 11 },
      ],
    });

    expect(result).toEqual({
      request: {
        timeMin: "2025-04-01T00:00:00.000Z",
        timeMax: "2025-06-01T00:00:00.000Z",
        items: [{ id: "a@example.com" }, { id: "b@example.com" }, { id: "c@example.com" }],
      },
      entries: [
        {
          timeMin: "2025-04-01T00:00:00.000Z",
          timeMax: "2025-06-01T00:00:00.000Z",
          items: [{ id: "a@example.com" }, { id: "b@example.com" }],
        },
        {
          timeMin: "2025-04-01T00:00:00.000Z",
          timeMax: "2025-06-01T00:00:00.000Z",
          items: [{ id: "a@example.com" }, { id: "c@example.com" }],
        },
      ],
    });
  });

  it("should treat a missing eventTypeId as user level", () => {
    const result = buildFreeBusyBatch({
      timeMin,
      timeMax,
      selectedCalendars: [
        { externalId: "a@example.com" },
        { externalId: "b@example.com", eventTypeId: null },
      ],
    });

    expect(result).toEqual({
      request: {
        timeMin: "2025-04-01T00:00:00.000Z",
        timeMax: "2025-06-01T00:00:00.000Z",
        items: [{ id: "a@example.com" }, { id: "b@example.com" }],
      },
      entries: [
        {
          timeMin: "2025-04-01T00:00:00.000Z",
          timeMax: "2025-06-01T00:00:00.000Z",
          items: [{ id: "a@example.com" }, { id: "b@example.com" }],
        },
      ],
    });
  });

  it("should keep calendar order of each group because it is part of the cache key", () => {
    const result = buildFreeBusyBatch({
      timeMin,
      timeMax,
      selectedCalendars: [
        { externalId: "b@example.com", eventTypeId: 5 },
        { externalId: "a@example.com", eventTypeId: 5 },
        { externalId: "a@example.com", eventTypeId: 6 },
        { externalId: "b@example.com", eventTypeId: 6 },
      ],
    });

    expect(result.entries.map((entry) => entry.items)).toEqual([
      [{ id: "b@example.com" }, { id: "a@example.com" }],
      [{ id: "a@example.com" }, { id: "b@example.com" }],
    ]);
    expect(result.request.items).toEqual([{ id: "b@example.com" }, { id: "a@example.com" }]);
  });

  it("should return no entries when there are no selected calendars", () => {
    expect(buildFreeBusyBatch({ timeMin, timeMax, selectedCalendars: [] })).toEqual({
      request: {
        timeMin: "2025-04-01T00:00:00.000Z",
        timeMax: "2025-06-01T00:00:00.000Z",
        items: [],
      },
      entries: [],
    });
  });
});
