import dayjs from "dayjs";

import type { Availability } from "@calcom/prisma/client";

import { MINUTES_DAY_END, MINUTES_IN_DAY } from "./availability";

type WorkingHoursSlot = Pick<Availability, "days" | "startTime" | "endTime">;

const getMinutesOfDay = (time: Date) => time.getUTCHours() * 60 + time.getUTCMinutes();

const getSlotEndMinutes = (slot: WorkingHoursSlot) => {
  const endMinutes = getMinutesOfDay(slot.endTime);
  return endMinutes === MINUTES_DAY_END ? MINUTES_IN_DAY : endMinutes;
};

export function isWithinWorkingHours({
  date,
  timeZone,
  workingHours,
}: {
  date: Date;
  timeZone: string;
  workingHours: WorkingHoursSlot[];
}): boolean {
  const localDate = dayjs(date).tz(timeZone);
  const localMinutes = localDate.hour() * 60 + localDate.minute();

  return workingHours.some((slot) => {
    if (!slot.days.includes(localDate.date())) {
      return false;
    }

    return localMinutes >= getMinutesOfDay(slot.startTime) && localMinutes < getSlotEndMinutes(slot);
  });
}
