import type { Prisma } from "@prisma/client";

import dayjs from "@calcom/dayjs";
import { getBusyCalendarTimes } from "@calcom/lib/CalendarManager";
import type { BusyTimesBooking } from "@calcom/lib/bookingBusyTimes";
import {
  getBusyTimesFromBookings,
  getCalendarBusyTimeExclusions,
  subtractCalendarBusyTimes,
} from "@calcom/lib/bookingBusyTimes";
import { stringToDayjs } from "@calcom/lib/dayjs";
import { intervalLimitKeyToUnit } from "@calcom/lib/intervalLimits/intervalLimit";
import type { IntervalLimit } from "@calcom/lib/intervalLimits/intervalLimitSchema";
import logger from "@calcom/lib/logger";
import { getPiiFreeBooking } from "@calcom/lib/piiFreeData";
import { withReporting } from "@calcom/lib/sentryWrapper";
import { performance } from "@calcom/lib/server/perfObserver";
import prisma from "@calcom/prisma";
import type { SelectedCalendar } from "@calcom/prisma/client";
import { BookingStatus } from "@calcom/prisma/enums";
import type { EventBusyDetails } from "@calcom/types/Calendar";
import type { CredentialForCalendarService } from "@calcom/types/Credential";

import { getDefinedBufferTimes } from "../features/eventtypes/lib/getDefinedBufferTimes";
import { BookingRepository } from "./server/repository/booking";

const _getBusyTimes = async (params: {
  credentials: CredentialForCalendarService[];
  userId: number;
  userEmail: string;
  username: string;
  eventTypeId?: number;
  startTime: string;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  endTime: string;
  selectedCalendars: SelectedCalendar[];
  seatedEvent?: boolean;
  rescheduleUid?: string | null;
  duration?: number | null;
  currentBookings?: BusyTimesBooking[] | null;
  bypassBusyCalendarTimes: boolean;
  shouldServeCache?: boolean;
}) => {
  const {
    credentials,
    userId,
    userEmail,
    username,
    eventTypeId,
    startTime,
    endTime,
    beforeEventBuffer,
    afterEventBuffer,
    selectedCalendars,
    seatedEvent,
    rescheduleUid,
    duration,
    bypassBusyCalendarTimes = false,
    shouldServeCache,
  } = params;

  logger.silly(
    `Checking Busy time from Cal Bookings in range ${startTime} to ${endTime} for input ${JSON.stringify({
      userId,
      eventTypeId,
      status: BookingStatus.ACCEPTED,
    })}`
  );

  /**
   * A user is considered busy within a given time period if there
   * is a booking they own OR attend.
   *
   * Performs a query for all bookings where:
   *   - The given booking is owned by this user, or..
   *   - The current user has a different booking at this time he/she attends
   *
   * See further discussion within this GH issue:
   * https://github.com/calcom/cal.com/issues/6374
   *
   * NOTE: Changes here will likely require changes to some mocking
   *  logic within getSchedule.test.ts:addBookings
   */
  performance.mark("prismaBookingGetStart");

  const startTimeDate =
    rescheduleUid && duration ? dayjs(startTime).subtract(duration, "minute").toDate() : new Date(startTime);
  const endTimeDate =
    rescheduleUid && duration ? dayjs(endTime).add(duration, "minute").toDate() : new Date(endTime);

  // to also get bookings that are outside of start and end time, but the buffer falls within the start and end time
  const definedBufferTimes = getDefinedBufferTimes();
  const maxBuffer = definedBufferTimes[definedBufferTimes.length - 1];
  const startTimeAdjustedWithMaxBuffer = dayjs(startTimeDate).subtract(maxBuffer, "minute").toDate();
  const endTimeAdjustedWithMaxBuffer = dayjs(endTimeDate).add(maxBuffer, "minute").toDate();

  // INFO: Refactored to allow this method to take in a list of current bookings for the user.
  // Will keep support for retrieving a user's bookings if the caller does not already supply them.
  // This function is called from multiple places but we aren't refactoring all of them at this moment
  // to avoid potential side effects.
  let bookings = params.currentBookings;

  if (!bookings) {
    const bookingRepo = new BookingRepository(prisma);
    bookings = await bookingRepo.findAllExistingBookingsForEventTypeBetween({
      userIdAndEmailMap: new Map([[userId, userEmail]]),
      eventTypeId,
      startDate: startTimeAdjustedWithMaxBuffer,
      endDate: endTimeAdjustedWithMaxBuffer,
      seatedEvent,
    });
  }

  const { busyTimes, openSeatsDateRanges } = getBusyTimesFromBookings({
    bookings,
    eventTypeId,
    rescheduleUid,
    beforeEventBuffer,
    afterEventBuffer,
  });

  logger.debug(
    `Busy Time from Cal Bookings ${JSON.stringify({
      busyTimes,
      bookings: bookings?.map((booking) => getPiiFreeBooking(booking)),
      numCredentials: credentials?.length,
    })}`
  );
  performance.mark("prismaBookingGetEnd");
  performance.measure(`prisma booking get took $1'`, "prismaBookingGetStart", "prismaBookingGetEnd");
  if (credentials?.length > 0 && !bypassBusyCalendarTimes) {
    const startConnectedCalendarsGet = performance.now();
    const calendarBusyTimes = await getBusyCalendarTimes(
      credentials,
      startTime,
      endTime,
      selectedCalendars,
      shouldServeCache
    );
    const endConnectedCalendarsGet = performance.now();
    logger.debug(
      `Connected Calendars get took ${
        endConnectedCalendarsGet - startConnectedCalendarsGet
      } ms for user ${username}`,
      JSON.stringify({
        eventTypeId,
        startTimeDate,
        endTimeDate,
        calendarBusyTimes,
      })
    );

    const exclusions = getCalendarBusyTimeExclusions({
      openSeatsDateRanges,
      bookings: bookings.filter((booking) => booking.uid !== rescheduleUid),
      rescheduleUid,
    });

    busyTimes.push(
      ...subtractCalendarBusyTimes({
        calendarBusyTimes,
        exclusions,
        beforeEventBuffer,
        afterEventBuffer,
      })
    );

    /*
    // TODO: Disabled until we can filter Zoom events by date. Also this is adding too much latency.
    const videoBusyTimes = (await getBusyVideoTimes(credentials)).filter(notEmpty);
    console.log("videoBusyTimes", videoBusyTimes);
    busyTimes.push(...videoBusyTimes);
    */
  }
  logger.debug(
    "getBusyTimes:",
    JSON.stringify({
      allBusyTimes: busyTimes,
    })
  );
  return busyTimes;
};

export const getBusyTimes = withReporting(_getBusyTimes, "getBusyTimes");

export function getStartEndDateforLimitCheck(
  startDate: string,
  endDate: string,
  bookingLimits?: IntervalLimit | null,
  durationLimits?: IntervalLimit | null
) {
  const startTimeAsDayJs = stringToDayjs(startDate);
  const endTimeAsDayJs = stringToDayjs(endDate);

  let limitDateFrom = stringToDayjs(startDate);
  let limitDateTo = stringToDayjs(endDate);

  // expand date ranges by absolute minimum required to apply limits
  // (yearly limits are handled separately for performance)
  for (const key of ["PER_MONTH", "PER_WEEK", "PER_DAY"] as Exclude<keyof IntervalLimit, "PER_YEAR">[]) {
    if (bookingLimits?.[key] || durationLimits?.[key]) {
      const unit = intervalLimitKeyToUnit(key);
      limitDateFrom = dayjs.min(limitDateFrom, startTimeAsDayJs.startOf(unit));
      limitDateTo = dayjs.max(limitDateTo, endTimeAsDayJs.endOf(unit));
    }
  }

  return { limitDateFrom, limitDateTo };
}

export async function getBusyTimesForLimitChecks(params: {
  userIds: number[];
  eventTypeId: number;
  startDate: string;
  endDate: string;
  rescheduleUid?: string | null;
  bookingLimits?: IntervalLimit | null;
  durationLimits?: IntervalLimit | null;
}) {
  const { userIds, eventTypeId, startDate, endDate, rescheduleUid, bookingLimits, durationLimits } = params;

  performance.mark("getBusyTimesForLimitChecksStart");

  let busyTimes: EventBusyDetails[] = [];

  if (!bookingLimits && !durationLimits) {
    return busyTimes;
  }

  const { limitDateFrom, limitDateTo } = getStartEndDateforLimitCheck(
    startDate,
    endDate,
    bookingLimits,
    durationLimits
  );

  logger.silly(
    `Fetch limit checks bookings in range ${limitDateFrom} to ${limitDateTo} for input ${JSON.stringify({
      eventTypeId,
      status: BookingStatus.ACCEPTED,
    })}`
  );

  const where: Prisma.BookingWhereInput = {
    userId: {
      in: userIds,
    },
    eventTypeId,
    status: BookingStatus.ACCEPTED,
    // FIXME: bookings that overlap on one side will never be counted
    startTime: {
      gte: limitDateFrom.toDate(),
    },
    endTime: {
      lte: limitDateTo.toDate(),
    },
  };

  if (rescheduleUid) {
    where.NOT = {
      uid: rescheduleUid,
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      id: true,
      startTime: true,
      endTime: true,
      eventType: {
        select: {
          id: true,
        },
      },
      title: true,
      userId: true,
    },
  });

  busyTimes = bookings.map(({ id, startTime, endTime, eventType, title, userId }) => ({
    start: dayjs(startTime).toDate(),
    end: dayjs(endTime).toDate(),
    title,
    source: `eventType-${eventType?.id}-booking-${id}`,
    userId,
  }));

  logger.silly(`Fetch limit checks bookings for eventId: ${eventTypeId} ${JSON.stringify(busyTimes)}`);
  performance.mark("getBusyTimesForLimitChecksEnd");
  performance.measure(
    `prisma booking get for limits took $1'`,
    "getBusyTimesForLimitChecksStart",
    "getBusyTimesForLimitChecksEnd"
  );
  return busyTimes;
}

export default withReporting(_getBusyTimes, "getBusyTimes");
