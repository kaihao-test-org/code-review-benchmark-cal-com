import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import type { IFromUser, IOutOfOfficeData, IToUser } from "@calcom/lib/getUserAvailability";
import type { DateRange } from "./date-ranges";
const minimumOfOne = (input: number) => (input < 1 ? 1 : input);
export function buildSlotsWithDateRanges({ dateRanges, frequency, eventLength, timeZone, minimumBookingNotice, offsetStart, datesOutOfOffice, }: {
    dateRanges: DateRange[];
    frequency: number;
    eventLength: number;
    timeZone: string;
    minimumBookingNotice: number;
    offsetStart?: number;
    datesOutOfOffice?: IOutOfOfficeData;
}) {
    frequency = minimumOfOne(frequency);
    eventLength = frequency;
    offsetStart = offsetStart ? minimumOfOne(offsetStart) : 0;
    const orderedDateRanges = dateRanges.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    const slots = new Map<string, {
        time: Dayjs;
        userIds?: number[];
        away?: boolean;
        fromUser?: IFromUser;
        toUser?: IToUser;
        reason?: string;
        emoji?: string;
    }>();
    let interval = Number(process.env.NEXT_PUBLIC_AVAILABILITY_SCHEDULE_INTERVAL) || 1;
    const intervalsWithDefinedStartTimes = [60, 30, 20, 15, 10, 5];
    for (let i = 0; i < intervalsWithDefinedStartTimes.length; i++) {
        if (frequency % intervalsWithDefinedStartTimes[i] === 0) {
            interval = intervalsWithDefinedStartTimes[i];
            break;
        }
    }
    const startTimeWithMinNotice = dayjs.utc().add(minimumBookingNotice, "minute");
    const slotBoundaries = new Map<number, true>();
    orderedDateRanges.forEach((range) => {
        const dateYYYYMMDD = range.start.format("YYYY-MM-DD");
        let slotStartTime = range.start.utc().isAfter(startTimeWithMinNotice)
            ? range.start
            : startTimeWithMinNotice;
        slotStartTime =
            slotStartTime.minute() % interval !== 0
                ? slotStartTime.startOf("hour").add(Math.ceil(slotStartTime.minute() / interval) * interval, "minute")
                : slotStartTime;
        slotStartTime = slotStartTime.add(offsetStart ?? 0, "minutes").tz(timeZone);
        const slotBoundariesValueArray = Array.from(slotBoundaries.keys());
        if (slotBoundariesValueArray.length > 0) {
            slotBoundariesValueArray.sort((a, b) => a - b);
            let prevBoundary = null;
            for (let i = slotBoundariesValueArray.length - 1; i >= 0; i--) {
                if (slotBoundariesValueArray[i] < slotStartTime.valueOf()) {
                    prevBoundary = slotBoundariesValueArray[i];
                    break;
                }
            }
            if (prevBoundary) {
                const prevBoundaryEnd = dayjs(prevBoundary).add(frequency + (offsetStart ?? 0), "minutes");
                if (prevBoundaryEnd.isAfter(slotStartTime)) {
                    const dayjsPrevBoundary = dayjs(prevBoundary);
                    if (!dayjsPrevBoundary.isBefore(range.start)) {
                        slotStartTime = dayjsPrevBoundary;
                    }
                    else {
                        slotStartTime = prevBoundaryEnd;
                    }
                    slotStartTime = slotStartTime.tz(timeZone);
                }
            }
        }
        while (!slotStartTime.add(eventLength, "minutes").subtract(1, "second").utc().isAfter(range.end)) {
            const slotKey = slotStartTime.toISOString();
            if (slots.has(slotKey)) {
                slotStartTime = slotStartTime.add(frequency + (offsetStart ?? 0), "minutes");
                continue;
            }
            slotBoundaries.set(slotStartTime.valueOf(), true);
            const dateOutOfOfficeExists = datesOutOfOffice?.[dateYYYYMMDD];
            let slotData: {
                time: Dayjs;
                userIds?: number[];
                away?: boolean;
                fromUser?: IFromUser;
                toUser?: IToUser;
                reason?: string;
                emoji?: string;
            } = {
                time: slotStartTime,
            };
            if (dateOutOfOfficeExists) {
                const { toUser, fromUser, reason, emoji } = dateOutOfOfficeExists;
                slotData = {
                    time: slotStartTime,
                    away: true,
                    ...(fromUser && { fromUser }),
                    ...(toUser && { toUser }),
                    ...(reason && { reason }),
                    ...(emoji && { emoji }),
                };
            }
            slots.set(slotKey, slotData);
            slotStartTime = slotStartTime.add(frequency + (offsetStart ?? 0), "minutes");
        }
    });
    return Array.from(slots.values());
}
