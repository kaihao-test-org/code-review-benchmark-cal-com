import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";

export const formatUtcOffset = (offsetInMinutes: number) => {
  const sign = offsetInMinutes < 0 ? "-" : "+";
  const absoluteOffset = Math.abs(offsetInMinutes);
  const hours = Math.floor(absoluteOffset / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absoluteOffset % 60).toString().padStart(2, "0");

  return `${sign}${hours}:${minutes}`;
};

export const getTimezoneDisplay = (timeZone: string, at: Dayjs = dayjs()) => {
  const localTime = at.tz(timeZone);

  return {
    time: localTime.format("HH:mm"),
    utcOffset: formatUtcOffset(localTime.utcOffset()),
  };
};
