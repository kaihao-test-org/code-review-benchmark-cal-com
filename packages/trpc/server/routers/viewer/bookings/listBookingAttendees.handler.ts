import { prisma } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";
import type { TListBookingAttendeesInputSchema } from "./listBookingAttendees.schema";

type ListBookingAttendeesOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListBookingAttendeesInputSchema;
};

export const listBookingAttendeesHandler = async ({ ctx, input }: ListBookingAttendeesOptions) => {
  const booking = await prisma.booking.findFirst({
    where: {
      uid: input.bookingUid,
      userId: ctx.user.id,
    },
    select: {
      attendees: {
        select: {
          id: true,
          name: true,
          email: true,
          timeZone: true,
          noShow: true,
        },
      },
    },
  });

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "booking_not_found" });
  }

  return booking.attendees;
};
