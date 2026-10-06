import { computeAvailability } from "./precomputedAvailability";
import type {
  Booking,
  Prisma,
  OutOfOfficeEntry,
  OutOfOfficeReason,
  User,
  EventType as PrismaEventType,
} from "@prisma/client";

import { z } from "zod";

import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";

import type { DateOverride, WorkingHours } from "@calcom/lib/date-ranges";

import { stringToDayjsZod } from "@calcom/lib/dayjs";

import logger from "@calcom/lib/logger";

import { findUsersForAvailabilityCheck } from "@calcom/lib/server/findUsersForAvailabilityCheck";

import prisma from "@calcom/prisma";
import { SchedulingType } from "@calcom/prisma/enums";
import { BookingStatus } from "@calcom/prisma/enums";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";
import type { EventBusyDetails, IntervalLimitUnit } from "@calcom/types/Calendar";

import { withReporting } from "./sentryWrapper";

const log = logger.getSubLogger({ prefix: ["getUserAvailability"] });
export const availabilitySchema = z
  .object({
    dateFrom: stringToDayjsZod,
    dateTo: stringToDayjsZod,
    eventTypeId: z.number().optional(),
    username: z.string().optional(),
    userId: z.number().optional(),
    afterEventBuffer: z.number().optional(),
    beforeEventBuffer: z.number().optional(),
    duration: z.number().optional(),
    withSource: z.boolean().optional(),
    returnDateOverrides: z.boolean(),
    bypassBusyCalendarTimes: z.boolean().optional(),
    shouldServeCache: z.boolean().optional(),
  })
  .refine((data) => !!data.username || !!data.userId, "Either username or userId should be filled in.");

const _getEventType = async (id: number) => {
  const eventType = await prisma.eventType.findUnique({
    where: { id },
    select: {
      id: true,
      seatsPerTimeSlot: true,
      bookingLimits: true,
      useEventLevelSelectedCalendars: true,
      parent: {
        select: {
          team: {
            select: {
              id: true,
              bookingLimits: true,
              includeManagedEventsInLimits: true,
            },
          },
        },
      },
      team: {
        select: {
          id: true,
          bookingLimits: true,
          includeManagedEventsInLimits: true,
        },
      },
      hosts: {
        select: {
          user: {
            select: {
              email: true,
              id: true,
            },
          },
          schedule: {
            select: {
              availability: {
                select: {
                  date: true,
                  startTime: true,
                  endTime: true,
                  days: true,
                },
              },
              timeZone: true,
              id: true,
            },
          },
        },
      },
      durationLimits: true,
      assignAllTeamMembers: true,
      schedulingType: true,
      timeZone: true,
      length: true,
      metadata: true,
      schedule: {
        select: {
          id: true,
          availability: {
            select: {
              days: true,
              date: true,
              startTime: true,
              endTime: true,
            },
          },
          timeZone: true,
        },
      },
      availability: {
        select: {
          startTime: true,
          endTime: true,
          days: true,
          date: true,
        },
      },
    },
  });
  if (!eventType) {
    return eventType;
  }
  return {
    ...eventType,
    metadata: EventTypeMetaDataSchema.parse(eventType.metadata),
  };
};

export type EventType = Awaited<ReturnType<typeof _getEventType>>;

export const getEventType = withReporting(_getEventType, "getEventType");

const _getUser = async (where: Prisma.UserWhereInput) => {
  return findUsersForAvailabilityCheck({ where });
};

type GetUser = Awaited<ReturnType<typeof _getUser>>;

export const getUser = withReporting(_getUser, "getUser");

export type GetUserAvailabilityInitialData = {
  user?: GetUser;
  eventType?: EventType;
  currentSeats?: CurrentSeats;
  rescheduleUid?: string | null;
  currentBookings?: (Pick<Booking, "id" | "uid" | "userId" | "startTime" | "endTime" | "title"> & {
    eventType: Pick<
      PrismaEventType,
      "id" | "beforeEventBuffer" | "afterEventBuffer" | "seatsPerTimeSlot"
    > | null;
    _count?: {
      seatsReferences: number;
    };
  })[];
  outOfOfficeDays?: (Pick<OutOfOfficeEntry, "id" | "start" | "end"> & {
    user: Pick<User, "id" | "name">;
    toUser: Pick<User, "id" | "username" | "name"> | null;
    reason: Pick<OutOfOfficeReason, "id" | "emoji" | "reason"> | null;
  })[];
  busyTimesFromLimitsBookings: EventBusyDetails[];
  busyTimesFromLimits?: Map<number, EventBusyDetails[]>;
  eventTypeForLimits?: {
    id: number;
    bookingLimits?: unknown;
    durationLimits?: unknown;
  } | null;
  teamBookingLimits?: Map<number, EventBusyDetails[]>;
  teamForBookingLimits?: {
    id: number;
    bookingLimits?: unknown;
    includeManagedEventsInLimits: boolean;
  } | null;
};

export type GetAvailabilityUser = NonNullable<GetUserAvailabilityInitialData["user"]>;

export type GetUserAvailabilityQuery = {
  withSource?: boolean;
  username?: string;
  userId?: number;
  dateFrom: string;
  dateTo: string;
  eventTypeId?: number;
  afterEventBuffer?: number;
  beforeEventBuffer?: number;
  duration?: number;
  returnDateOverrides: boolean;
  bypassBusyCalendarTimes: boolean;
  shouldServeCache?: boolean;
};

const _getCurrentSeats = async (
  eventType: {
    id?: number;
    schedulingType?: SchedulingType | null;
    hosts?: {
      user: {
        email: string;
      };
    }[];
  },
  dateFrom: Dayjs,
  dateTo: Dayjs
) => {
  const { schedulingType, hosts, id } = eventType;
  const hostEmails = hosts?.map((host) => host.user.email);
  const isTeamEvent =
    schedulingType === SchedulingType.MANAGED ||
    schedulingType === SchedulingType.ROUND_ROBIN ||
    schedulingType === SchedulingType.COLLECTIVE;

  const bookings = await prisma.booking.findMany({
    where: {
      eventTypeId: id,
      startTime: {
        gte: dateFrom.format(),
        lte: dateTo.format(),
      },
      status: BookingStatus.ACCEPTED,
    },
    select: {
      uid: true,
      startTime: true,
      attendees: {
        select: {
          email: true,
        },
      },
    },
  });

  return bookings.map((booking) => {
    const attendees = isTeamEvent
      ? booking.attendees.filter((attendee) => !hostEmails?.includes(attendee.email))
      : booking.attendees;

    return {
      uid: booking.uid,
      startTime: booking.startTime,
      _count: {
        attendees: attendees.length,
      },
    };
  });
};

export type CurrentSeats = Awaited<ReturnType<typeof _getCurrentSeats>>;

export const getCurrentSeats = withReporting(_getCurrentSeats, "getCurrentSeats");


/** This should be called getUsersWorkingHoursAndBusySlots (...and remaining seats, and final timezone) */

export const getAvailabilitySnapshot = withReporting(computeAvailability, "getAvailabilitySnapshot");

const _getPeriodStartDatesBetween = (
  dateFrom: Dayjs,
  dateTo: Dayjs,
  period: IntervalLimitUnit,
  timeZone?: string
): Dayjs[] => {
  const dates = [];
  let startDate = timeZone ? dayjs(dateFrom).tz(timeZone).startOf(period) : dayjs(dateFrom).startOf(period);
  const endDate = timeZone ? dayjs(dateTo).tz(timeZone).endOf(period) : dayjs(dateTo).endOf(period);

  while (startDate.isBefore(endDate)) {
    dates.push(startDate);
    startDate = startDate.add(1, period);
  }
  return dates;
};

export const getPeriodStartDatesBetween = withReporting(
  _getPeriodStartDatesBetween,
  "getPeriodStartDatesBetween"
);

interface GetUserAvailabilityParamsDTO {
  availability: (DateOverride | WorkingHours)[];
}

export interface IFromUser {
  id: number;
  displayName: string | null;
}

export interface IToUser {
  id: number;
  username: string | null;
  displayName: string | null;
}

export interface IOutOfOfficeData {
  [key: string]: {
    fromUser: IFromUser | null;
    toUser?: IToUser | null;
    reason?: string | null;
    emoji?: string | null;
  };
}

export const calculateOutOfOfficeRanges = (
  outOfOfficeDays: GetUserAvailabilityInitialData["outOfOfficeDays"],
  availability: GetUserAvailabilityParamsDTO["availability"]
): IOutOfOfficeData => {
  if (!outOfOfficeDays || outOfOfficeDays.length === 0) {
    return {};
  }

  return outOfOfficeDays.reduce((acc: IOutOfOfficeData, { start, end, toUser, user, reason }) => {
    // here we should use startDate or today if start is before today
    // consider timezone in start and end date range
    const startDateRange = dayjs(start).utc().isBefore(dayjs().startOf("day").utc())
      ? dayjs().utc().startOf("day")
      : dayjs(start).utc().startOf("day");

    // get number of day in the week and see if it's on the availability
    const flattenDays = Array.from(new Set(availability.flatMap((a) => ("days" in a ? a.days : [])))).sort(
      (a, b) => a - b
    );

    const endDateRange = dayjs(end).utc().endOf("day");

    for (let date = startDateRange; date.isBefore(endDateRange); date = date.add(1, "day")) {
      const dayNumberOnWeek = date.day();

      if (!flattenDays?.includes(dayNumberOnWeek)) {
        continue; // Skip to the next iteration if day not found in flattenDays
      }

      acc[date.format("YYYY-MM-DD")] = {
        // @TODO:  would be good having start and end availability time here, but for now should be good
        // you can obtain that from user availability defined outside of here
        fromUser: { id: user.id, displayName: user.name },
        // optional chaining destructuring toUser
        toUser: !!toUser ? { id: toUser.id, displayName: toUser.name, username: toUser.username } : null,
        reason: !!reason ? reason.reason : null,
        emoji: !!reason ? reason.emoji : null,
      };
    }

    return acc;
  }, {});
};

type GetUsersAvailabilityProps = {
  users: (GetAvailabilityUser & {
    currentBookings?: GetUserAvailabilityInitialData["currentBookings"];
    outOfOfficeDays?: GetUserAvailabilityInitialData["outOfOfficeDays"];
  })[];
  query: Omit<GetUserAvailabilityQuery, "userId" | "username">;
  initialData?: Omit<GetUserAvailabilityInitialData, "user">;
};

const _getUsersAvailability = async ({ users, query, initialData }: GetUsersAvailabilityProps) => {
  if (users.length >= 50) {
    const userIds = users.map(({ id }) => id).join(", ");
    log.warn(
      `High-load warning: Attempting to fetch availability for ${users.length} users. User IDs: [${userIds}], EventTypeId: [${query.eventTypeId}]`
    );
  }
  return await Promise.all(
    users.map((user) =>
      computeAvailability(
        {
          ...query,
          userId: user.id,
          username: user.username || "",
        },
        initialData
          ? {
              ...initialData,
              user,
              currentBookings: user.currentBookings,
              outOfOfficeDays: user.outOfOfficeDays,
            }
          : undefined
      )
    )
  );
};

export const getUsersAvailability = withReporting(_getUsersAvailability, "getUsersAvailability");
