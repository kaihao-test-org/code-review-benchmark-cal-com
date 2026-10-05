import type { Prisma } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import dayjs from "@calcom/dayjs";
import { getWorkingHours } from "@calcom/lib/availability";
import { buildDateRanges, subtract } from "@calcom/lib/date-ranges";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { HttpError } from "@calcom/lib/http-error";
import { parseBookingLimit } from "@calcom/lib/intervalLimits/isBookingLimits";
import { parseDurationLimit } from "@calcom/lib/intervalLimits/isDurationLimits";
import { getBusyTimesFromLimits, getBusyTimesFromTeamLimits } from "@calcom/lib/intervalLimits/server/getBusyTimesFromLimits";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import { EventTypeRepository } from "@calcom/lib/server/repository/eventType";
import prisma from "@calcom/prisma";
import type { EventBusyDetails } from "@calcom/types/Calendar";
import type { TimeRange } from "@calcom/types/schedule";
import { getBusyTimes } from "./getBusyTimes";
import { availabilitySchema, getUser, getEventType, getCurrentSeats, calculateOutOfOfficeRanges } from "./getUserAvailability";
import type { GetUserAvailabilityQuery, GetUserAvailabilityInitialData, EventType, CurrentSeats, IOutOfOfficeData } from "./getUserAvailability";
const log = logger.getSubLogger({ prefix: ["getUserAvailability"] });
export const computeUserAvailability = async function getUsersWorkingHoursLifeTheUniverseAndEverythingElse(query: GetUserAvailabilityQuery, initialData?: GetUserAvailabilityInitialData) {
    const { username, userId, dateFrom, dateTo, eventTypeId, afterEventBuffer, beforeEventBuffer, duration, returnDateOverrides, bypassBusyCalendarTimes = false, shouldServeCache, } = availabilitySchema.parse(query);
    log.debug(`EventType: ${eventTypeId} | User: ${username} (ID: ${userId}) - Called with: ${safeStringify({
        query,
    })}`);
    if (!dateFrom.isValid() || !dateTo.isValid()) {
        throw new HttpError({ statusCode: 400, message: "Invalid time range given." });
    }
    const where: Prisma.UserWhereInput = {};
    if (username)
        where.username = username;
    if (userId)
        where.id = userId;
    const user = initialData?.user || (await getUser(where));
    if (!user) {
        throw new HttpError({ statusCode: 404, message: "No user found in getUserAvailability" });
    }
    let eventType: EventType | null = initialData?.eventType || null;
    if (!eventType && eventTypeId)
        eventType = await getEventType(eventTypeId);
    let currentSeats: CurrentSeats | null = initialData?.currentSeats || null;
    if (!currentSeats && eventType?.seatsPerTimeSlot) {
        currentSeats = await getCurrentSeats(eventType, dateFrom, dateTo);
    }
    const userSchedule = user.schedules.filter((schedule) => !user?.defaultScheduleId || schedule.id === user?.defaultScheduleId)[0];
    const hostSchedule = eventType?.hosts?.find((host) => host.user.id === user.id)?.schedule;
    const fallbackTimezoneIfScheduleIsMissing = eventType?.timeZone || user.timeZone;
    const fallbackSchedule = {
        availability: [
            {
                startTime: new Date("1970-01-01T09:00:00Z"),
                endTime: new Date("1970-01-01T17:00:00Z"),
                days: [1, 2, 3, 4, 5],
                date: null,
            },
        ],
        id: 0,
        timeZone: fallbackTimezoneIfScheduleIsMissing,
    };
    const schedule = (eventType?.schedule ? eventType.schedule : hostSchedule ? hostSchedule : userSchedule) ??
        fallbackSchedule;
    const timeZone = schedule?.timeZone || fallbackTimezoneIfScheduleIsMissing;
    const bookingLimits = eventType?.bookingLimits &&
        typeof eventType.bookingLimits === "object" &&
        Object.keys(eventType.bookingLimits).length > 0
        ? parseBookingLimit(eventType.bookingLimits)
        : null;
    const durationLimits = eventType?.durationLimits &&
        typeof eventType.durationLimits === "object" &&
        Object.keys(eventType.durationLimits).length > 0
        ? parseDurationLimit(eventType.durationLimits)
        : null;
    let busyTimesFromLimits: EventBusyDetails[] = [];
    if (initialData?.busyTimesFromLimits && initialData?.eventTypeForLimits) {
        busyTimesFromLimits = initialData.busyTimesFromLimits.get(user.id) || [];
    }
    else if (eventType && (bookingLimits || durationLimits)) {
        busyTimesFromLimits = await getBusyTimesFromLimits(bookingLimits, durationLimits, dateFrom.tz(timeZone), dateTo.tz(timeZone), duration, eventType, initialData?.busyTimesFromLimitsBookings ?? [], timeZone, initialData?.rescheduleUid ?? undefined);
    }
    const teamForBookingLimits = initialData?.teamForBookingLimits ??
        eventType?.team ??
        (eventType?.parent?.team?.includeManagedEventsInLimits ? eventType?.parent?.team : null);
    const teamBookingLimits = parseBookingLimit(teamForBookingLimits?.bookingLimits);
    let busyTimesFromTeamLimits: EventBusyDetails[] = [];
    if (initialData?.teamBookingLimits && teamForBookingLimits) {
        busyTimesFromTeamLimits = initialData.teamBookingLimits.get(user.id) || [];
    }
    else if (teamForBookingLimits && teamBookingLimits) {
        busyTimesFromTeamLimits = await getBusyTimesFromTeamLimits(user, teamBookingLimits, dateFrom.tz(timeZone), dateTo.tz(timeZone), teamForBookingLimits.id, teamForBookingLimits.includeManagedEventsInLimits, timeZone, initialData?.rescheduleUid ?? undefined);
    }
    const getBusyTimesStart = dateFrom.toISOString();
    const getBusyTimesEnd = dateTo.toISOString();
    const selectedCalendars = eventType?.useEventLevelSelectedCalendars
        ? EventTypeRepository.getSelectedCalendarsFromUser({ user, eventTypeId: eventType.id })
        : user.userLevelSelectedCalendars;
    const busyTimes = await getBusyTimes({
        credentials: user.credentials,
        startTime: getBusyTimesStart,
        endTime: getBusyTimesEnd,
        eventTypeId,
        userId: user.id,
        userEmail: user.email,
        username: `${user.username}`,
        beforeEventBuffer,
        afterEventBuffer,
        selectedCalendars,
        seatedEvent: !!eventType?.seatsPerTimeSlot,
        rescheduleUid: initialData?.rescheduleUid || null,
        duration,
        currentBookings: initialData?.currentBookings,
        bypassBusyCalendarTimes,
        shouldServeCache,
    });
    const detailedBusyTimes: EventBusyDetails[] = [
        ...busyTimes.map((a) => ({
            ...a,
            start: dayjs(a.start).toISOString(),
            end: dayjs(a.end).toISOString(),
            title: a.title,
            source: query.withSource ? a.source : undefined,
        })),
        ...busyTimesFromTeamLimits,
    ];
    const isDefaultSchedule = userSchedule && userSchedule.id === schedule?.id;
    log.debug(`EventType: ${eventTypeId} | User: ${username} (ID: ${userId}) - usingSchedule: ${safeStringify({
        chosenSchedule: schedule,
        eventTypeSchedule: eventType?.schedule,
        userSchedule: userSchedule,
        hostSchedule: hostSchedule,
    })}`);
    if (!(schedule?.availability || (eventType?.availability.length ? eventType.availability : user.availability))) {
        throw new HttpError({ statusCode: 400, message: ErrorCode.AvailabilityNotFoundInSchedule });
    }
    const availability = (schedule?.availability || (eventType?.availability.length ? eventType.availability : user.availability)).map((a) => ({
        ...a,
        userId: user.id,
    }));
    const workingHours = getWorkingHours({ timeZone }, availability);
    const dateOverrides: TimeRange[] = [];
    if (returnDateOverrides) {
        const calculateDateOverridesSpan = Sentry.startInactiveSpan({ name: "calculateDateOverrides" });
        const availabilityWithDates = availability.filter((availability) => !!availability.date);
        for (let i = 0; i < availabilityWithDates.length; i++) {
            const override = availabilityWithDates[i];
            const startTime = dayjs.utc(override.startTime);
            const endTime = dayjs.utc(override.endTime);
            const overrideStartDate = dayjs.utc(override.date).hour(startTime.hour()).minute(startTime.minute());
            const overrideEndDate = dayjs.utc(override.date).hour(endTime.hour()).minute(endTime.minute());
            if (overrideStartDate.isBetween(dateFrom, dateTo, null, "[]") ||
                overrideEndDate.isBetween(dateFrom, dateTo, null, "[]")) {
                dateOverrides.push({
                    start: overrideStartDate.toDate(),
                    end: overrideEndDate.toDate(),
                });
            }
        }
        calculateDateOverridesSpan.end();
    }
    const outOfOfficeDays = initialData?.outOfOfficeDays ??
        (await prisma.outOfOfficeEntry.findMany({
            where: {
                userId: user.id,
                OR: [
                    {
                        start: {
                            lte: dateTo.toISOString(),
                        },
                        end: {
                            gte: dateFrom.toISOString(),
                        },
                    },
                    {
                        start: {
                            lte: dateTo.toISOString(),
                        },
                        end: {
                            gte: dateTo.toISOString(),
                        },
                    },
                    {
                        start: {
                            lte: dateFrom.toISOString(),
                        },
                        end: {
                            lte: dateTo.toISOString(),
                        },
                    },
                ],
            },
            select: {
                id: true,
                start: true,
                end: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                toUser: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
                reason: {
                    select: {
                        id: true,
                        emoji: true,
                        reason: true,
                    },
                },
            },
        }));
    const datesOutOfOffice: IOutOfOfficeData = calculateOutOfOfficeRanges(outOfOfficeDays, availability);
    const { dateRanges, oooExcludedDateRanges } = buildDateRanges({
        dateFrom,
        dateTo,
        availability,
        timeZone,
        travelSchedules: isDefaultSchedule
            ? user.travelSchedules.map((schedule) => {
                return {
                    startDate: dayjs(schedule.startDate),
                    endDate: schedule.endDate ? dayjs(schedule.endDate) : undefined,
                    timeZone: schedule.timeZone,
                };
            })
            : [],
        outOfOffice: datesOutOfOffice,
    });
    const formattedBusyTimes = detailedBusyTimes.map((busy) => ({
        start: dayjs(busy.start),
        end: dayjs(busy.end),
    }));
    const dateRangesInWhichUserIsAvailable = subtract(dateRanges, formattedBusyTimes);
    const dateRangesInWhichUserIsAvailableWithoutOOO = subtract(oooExcludedDateRanges, formattedBusyTimes);
    const result = {
        busy: detailedBusyTimes,
        timeZone,
        dateRanges: dateRangesInWhichUserIsAvailable,
        oooExcludedDateRanges: dateRangesInWhichUserIsAvailableWithoutOOO,
        workingHours,
        dateOverrides,
        currentSeats,
        datesOutOfOffice,
    };
    log.debug(`EventType: ${eventTypeId} | User: ${username} (ID: ${userId}) - Result: ${safeStringify(result)}`);
    return result;
};
