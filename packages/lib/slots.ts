import type { Dayjs } from "@calcom/dayjs";
import type { IOutOfOfficeData } from "@calcom/lib/getUserAvailability";
import type { DateRange } from "./date-ranges";
export type GetSlots = {
  inviteeDate: Dayjs;
  frequency: number;
  dateRanges: DateRange[];
  minimumBookingNotice: number;
  eventLength: number;
  offsetStart?: number;
  datesOutOfOffice?: IOutOfOfficeData;
};
export type TimeFrame = {
  userIds?: number[];
  startTime: number;
  endTime: number;
};
export function normalizeSlotRequest(input: GetSlots): GetSlots {
  return { ...input, frequency: Math.max(1, input.frequency), eventLength: Math.max(1, input.frequency) };
}
