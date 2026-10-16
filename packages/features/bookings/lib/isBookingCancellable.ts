import dayjs from "@calcom/dayjs";
import { BookingStatus } from "@calcom/prisma/enums";

const DEFAULT_MINIMUM_CANCELLATION_NOTICE_MINUTES = 60;

export type CancellableBooking = {
  startTime: Date;
  status: BookingStatus;
  eventType: {
    minimumCancellationNoticeMinutes: number | null;
  } | null;
};

export type CancellationCheck = {
  allowed: boolean;
  reason?: "already_cancelled" | "too_late";
  minutesUntilStart: number;
};

const getMinimumNoticeMinutes = (booking: CancellableBooking) =>
  booking.eventType?.minimumCancellationNoticeMinutes ?? DEFAULT_MINIMUM_CANCELLATION_NOTICE_MINUTES;

export function checkBookingCancellation(booking: CancellableBooking, now: Date = new Date()): CancellationCheck {
  const minutesUntilStart = dayjs(booking.startTime).diff(dayjs(now), "minute");

  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
    return { allowed: false, reason: "already_cancelled", minutesUntilStart };
  }

  if (minutesUntilStart > getMinimumNoticeMinutes(booking)) {
    return { allowed: false, reason: "too_late", minutesUntilStart };
  }

  return { allowed: true, minutesUntilStart };
}

export const isBookingCancellable = (booking: CancellableBooking, now?: Date) =>
  checkBookingCancellation(booking, now).allowed;
