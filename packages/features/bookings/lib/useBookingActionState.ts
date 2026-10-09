import { useSession } from "next-auth/react";

import dayjs from "@calcom/dayjs";
import { BookingStatus } from "@calcom/prisma/enums";

type BookingActionInput = {
  userId: number | null;
  status: BookingStatus;
  endTime: Date | string;
  eventType: {
    disableCancelling: boolean | null;
    disableRescheduling: boolean | null;
  } | null;
};

export const useBookingActionState = (booking: BookingActionInput) => {
  const session = useSession();

  const isOrganizer = !!session.data?.user.id && session.data.user.id === booking.userId;
  const isNotUnconfirmed = booking.status !== BookingStatus.PENDING;
  const isCancelled = booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED;
  const hasEnded = dayjs(booking.endTime).isBefore(dayjs());

  return {
    canConfirm: isOrganizer && !isNotUnconfirmed && !hasEnded,
    canCancel: !isCancelled && !hasEnded && !booking.eventType?.disableCancelling,
    canReschedule: !isCancelled && !hasEnded && !booking.eventType?.disableRescheduling,
  };
};
