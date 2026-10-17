import dayjs from "@calcom/dayjs";

export function isSameDayReschedule(originalStart: Date, newStart: Date, attendeeTimeZone: string): boolean {
  const original = dayjs(originalStart).startOf("day");
  const proposed = dayjs(newStart).startOf("day");
  return original.isSame(proposed);
}
