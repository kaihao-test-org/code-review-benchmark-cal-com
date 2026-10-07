import { describe, expect, it } from "vitest";

import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";

import type { BusyTimesBooking } from "./bookingBusyTimes";
import {
  getBusyTimesFromBookings,
  getCalendarBusyTimeExclusions,
  subtractCalendarBusyTimes,
} from "./bookingBusyTimes";

const defaultEventType = { id: 1, beforeEventBuffer: 0, afterEventBuffer: 0, seatsPerTimeSlot: null };

const seatedEventType = (seatsPerTimeSlot: number, beforeEventBuffer = 0, afterEventBuffer = 0) => ({
  id: 5,
  beforeEventBuffer,
  afterEventBuffer,
  seatsPerTimeSlot,
});

const makeBooking = (
  id: number,
  uid: string,
  times: [string, string],
  options: { eventType?: BusyTimesBooking["eventType"]; seatsReferences?: number } = {}
): BusyTimesBooking => ({
  id,
  uid,
  userId: 1,
  startTime: new Date(`2025-01-10T${times[0]}:00Z`),
  endTime: new Date(`2025-01-10T${times[1]}:00Z`),
  title: `Booking ${id}`,
  eventType: options.eventType ?? defaultEventType,
  ...(options.seatsReferences ? { _count: { seatsReferences: options.seatsReferences } } : {}),
});

const toIsoRanges = (ranges: { start: Dayjs; end: Dayjs }[]) =>
  ranges.map((range) => [range.start.toISOString(), range.end.toISOString()]);

describe("getBusyTimesFromBookings", () => {
  it("only blocks buffers for a seated event that still has remaining seats", () => {
    const options = { eventType: seatedEventType(3, 10, 5), seatsReferences: 1 };
    const result = getBusyTimesFromBookings({
      bookings: [makeBooking(1, "seated", ["10:00", "11:00"], options)],
      eventTypeId: 5,
    });

    expect(result.busyTimes).toEqual([
      { start: new Date("2025-01-10T09:50:00.000Z"), end: new Date("2025-01-10T10:00:00.000Z") },
      { start: new Date("2025-01-10T11:00:00.000Z"), end: new Date("2025-01-10T11:05:00.000Z") },
    ]);
    expect(toIsoRanges(result.openSeatsDateRanges)).toEqual([
      ["2025-01-10T10:00:00.000Z", "2025-01-10T11:00:00.000Z"],
    ]);
  });

  it("skips the booking with the same uid as the reschedule uid", () => {
    const result = getBusyTimesFromBookings({
      bookings: [makeBooking(3, "moved", ["10:00", "11:00"]), makeBooking(4, "other", ["12:00", "13:00"])],
      rescheduleUid: "moved",
    });

    expect(result.busyTimes).toEqual([
      {
        start: new Date("2025-01-10T12:00:00.000Z"),
        end: new Date("2025-01-10T13:00:00.000Z"),
        title: "Booking 4",
        source: "eventType-1-booking-4",
      },
    ]);
    expect(result.openSeatsDateRanges).toEqual([]);
  });

  it("keeps open seat ranges in booking order and blocks ranges that become fully booked", () => {
    const options = { eventType: seatedEventType(2), seatsReferences: 1 };
    const result = getBusyTimesFromBookings({
      bookings: [
        makeBooking(5, "late", ["14:00", "15:00"], options),
        makeBooking(6, "early-1", ["09:00", "10:00"], options),
        makeBooking(7, "middle", ["12:00", "13:00"], options),
        makeBooking(8, "early-2", ["09:00", "10:00"], options),
      ],
      eventTypeId: 5,
    });

    expect(result.busyTimes).toEqual([
      {
        start: new Date("2025-01-10T09:00:00.000Z"),
        end: new Date("2025-01-10T10:00:00.000Z"),
        title: "Booking 8",
        source: "eventType-5-booking-8",
      },
    ]);
    expect(toIsoRanges(result.openSeatsDateRanges)).toEqual([
      ["2025-01-10T14:00:00.000Z", "2025-01-10T15:00:00.000Z"],
      ["2025-01-10T12:00:00.000Z", "2025-01-10T13:00:00.000Z"],
    ]);
  });

  it("combines event type buffers with the requested before and after buffers", () => {
    const eventType = { id: 1, beforeEventBuffer: 10, afterEventBuffer: 0, seatsPerTimeSlot: null };
    const result = getBusyTimesFromBookings({
      bookings: [makeBooking(9, "buffered", ["10:00", "11:00"], { eventType })],
      beforeEventBuffer: 5,
      afterEventBuffer: 20,
    });

    expect(result.busyTimes).toEqual([
      {
        start: new Date("2025-01-10T09:30:00.000Z"),
        end: new Date("2025-01-10T11:05:00.000Z"),
        title: "Booking 9",
        source: "eventType-1-booking-9",
      },
    ]);
  });
});

describe("getCalendarBusyTimeExclusions", () => {
  const openSeatsDateRanges = [
    { start: dayjs("2025-01-10T14:00:00Z"), end: dayjs("2025-01-10T15:00:00Z") },
    { start: dayjs("2025-01-10T09:00:00Z"), end: dayjs("2025-01-10T10:00:00Z") },
  ];
  const bookings = [
    makeBooking(1, "first", ["11:00", "11:30"]),
    makeBooking(2, "", ["12:00", "12:30"]),
    makeBooking(3, "first", ["13:00", "13:30"]),
  ];

  it("appends the first booking matching the reschedule uid after the open seat ranges", () => {
    const exclusions = getCalendarBusyTimeExclusions({
      openSeatsDateRanges,
      bookings,
      rescheduleUid: "first",
    });

    expect(toIsoRanges(exclusions)).toEqual([
      ["2025-01-10T14:00:00.000Z", "2025-01-10T15:00:00.000Z"],
      ["2025-01-10T09:00:00.000Z", "2025-01-10T10:00:00.000Z"],
      ["2025-01-10T11:00:00.000Z", "2025-01-10T11:30:00.000Z"],
    ]);
  });

  it.each(["", "missing", null])("returns only open seat ranges for reschedule uid %j", (rescheduleUid) => {
    const exclusions = getCalendarBusyTimeExclusions({ openSeatsDateRanges, bookings, rescheduleUid });

    expect(toIsoRanges(exclusions)).toEqual([
      ["2025-01-10T14:00:00.000Z", "2025-01-10T15:00:00.000Z"],
      ["2025-01-10T09:00:00.000Z", "2025-01-10T10:00:00.000Z"],
    ]);
  });
});

describe("subtractCalendarBusyTimes", () => {
  it("removes exclusions and applies after buffer to starts and before buffer to ends", () => {
    const result = subtractCalendarBusyTimes({
      calendarBusyTimes: [
        { start: "2025-01-10T09:00:00Z", end: "2025-01-10T12:00:00Z", source: "google" },
        { start: new Date("2025-01-10T13:00:00Z"), end: new Date("2025-01-10T14:00:00Z") },
      ],
      exclusions: [
        { start: dayjs("2025-01-10T11:30:00Z"), end: dayjs("2025-01-10T13:30:00Z") },
        { start: dayjs("2025-01-10T10:00:00Z"), end: dayjs("2025-01-10T11:00:00Z") },
      ],
      beforeEventBuffer: 15,
      afterEventBuffer: 5,
    });

    expect(result).toEqual([
      {
        start: new Date("2025-01-10T08:55:00.000Z"),
        end: new Date("2025-01-10T10:15:00.000Z"),
        source: "google",
      },
      {
        start: new Date("2025-01-10T10:55:00.000Z"),
        end: new Date("2025-01-10T11:45:00.000Z"),
        source: "google",
      },
      { start: new Date("2025-01-10T13:25:00.000Z"), end: new Date("2025-01-10T14:15:00.000Z") },
    ]);
  });
});
