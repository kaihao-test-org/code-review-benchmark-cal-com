import type { Booking, EventType } from "@prisma/client";

import dayjs from "@calcom/dayjs";
import type { DateRange } from "@calcom/lib/date-ranges";
import { subtract } from "@calcom/lib/date-ranges";
import type { EventBusyDate, EventBusyDetails } from "@calcom/types/Calendar";

export type BusyTimesBooking = Pick<Booking, "id" | "uid" | "userId" | "startTime" | "endTime" | "title"> & {
  eventType: Pick<EventType, "id" | "beforeEventBuffer" | "afterEventBuffer" | "seatsPerTimeSlot"> | null;
  _count?: {
    seatsReferences: number;
  };
};

export function getBusyTimesFromBookings({
  bookings,
  eventTypeId,
  rescheduleUid,
  beforeEventBuffer,
  afterEventBuffer,
}: {
  bookings: BusyTimesBooking[];
  eventTypeId?: number;
  rescheduleUid?: string | null;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
}): { busyTimes: EventBusyDetails[]; openSeatsDateRanges: DateRange[] } {
  const bookingSeatCountMap: { [x: string]: number } = {};
  const busyTimes = bookings.reduce((aggregate: EventBusyDetails[], booking) => {
    const { id, startTime, endTime, eventType, title, ...rest } = booking;

    const minutesToBlockBeforeEvent = (eventType?.beforeEventBuffer || 0) + (afterEventBuffer || 0);
    const minutesToBlockAfterEvent = (eventType?.afterEventBuffer || 0) + (beforeEventBuffer || 0);

    if (rest._count?.seatsReferences) {
      const bookedAt = `${dayjs(startTime).utc().format()}<>${dayjs(endTime).utc().format()}`;
      bookingSeatCountMap[bookedAt] = bookingSeatCountMap[bookedAt] || 0;
      bookingSeatCountMap[bookedAt]++;
      if (
        bookingSeatCountMap[bookedAt] < (eventType?.seatsPerTimeSlot || 1) &&
        eventTypeId === eventType?.id
      ) {
        if (minutesToBlockBeforeEvent) {
          aggregate.push({
            start: dayjs(startTime).subtract(minutesToBlockBeforeEvent, "minute").toDate(),
            end: dayjs(startTime).toDate(),
          });
        }
        if (minutesToBlockAfterEvent) {
          aggregate.push({
            start: dayjs(endTime).toDate(),
            end: dayjs(endTime).add(minutesToBlockAfterEvent, "minute").toDate(),
          });
        }
        return aggregate;
      }
      delete bookingSeatCountMap[bookedAt];
    }
    if (rest.uid === rescheduleUid) {
      return aggregate;
    }
    aggregate.push({
      start: dayjs(startTime).subtract(minutesToBlockBeforeEvent, "minute").toDate(),
      end: dayjs(endTime).add(minutesToBlockAfterEvent, "minute").toDate(),
      title,
      source: `eventType-${eventType?.id}-booking-${id}`,
    });
    return aggregate;
  }, []);

  const openSeatsDateRanges = Object.keys(bookingSeatCountMap).map((key) => {
    const [start, end] = key.split("<>");
    return {
      start: dayjs(start),
      end: dayjs(end),
    };
  });

  return { busyTimes, openSeatsDateRanges };
}

export function getCalendarBusyTimeExclusions({
  openSeatsDateRanges,
  bookings,
  rescheduleUid,
}: {
  openSeatsDateRanges: DateRange[];
  bookings: Pick<BusyTimesBooking, "uid" | "startTime" | "endTime">[];
  rescheduleUid?: string | null;
}): DateRange[] {
  const exclusions = [...openSeatsDateRanges];

  if (rescheduleUid) {
    const originalRescheduleBooking = bookings.find((booking) => booking.uid === rescheduleUid);
    if (originalRescheduleBooking) {
      exclusions.push({
        start: dayjs(originalRescheduleBooking.startTime),
        end: dayjs(originalRescheduleBooking.endTime),
      });
    }
  }

  return exclusions;
}

export function subtractCalendarBusyTimes<T extends EventBusyDate>({
  calendarBusyTimes,
  exclusions,
  beforeEventBuffer,
  afterEventBuffer,
}: {
  calendarBusyTimes: T[];
  exclusions: DateRange[];
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
}) {
  const result = subtract(
    calendarBusyTimes.map((value) => ({
      ...value,
      end: dayjs(value.end),
      start: dayjs(value.start),
    })),
    exclusions
  );

  return result.map((busyTime) => ({
    ...busyTime,
    start: busyTime.start.subtract(afterEventBuffer || 0, "minute").toDate(),
    end: busyTime.end.add(beforeEventBuffer || 0, "minute").toDate(),
  }));
}
