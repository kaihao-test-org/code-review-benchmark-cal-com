import handleMarkNoShow from "@calcom/features/handleMarkNoShow";
import { prisma } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";
import type { TMarkAllAttendeesNoShowInputSchema } from "./markAllAttendeesNoShow.schema";

type MarkAllAttendeesNoShowOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TMarkAllAttendeesNoShowInputSchema;
};

export const markAllAttendeesNoShowHandler = async ({ ctx, input }: MarkAllAttendeesNoShowOptions) => {
  const booking = await prisma.booking.findFirst({
    where: {
      uid: input.bookingUid,
      userId: ctx.user.id,
    },
    select: {
      attendees: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "booking_not_found" });
  }

  return await handleMarkNoShow({
    bookingUid: input.bookingUid,
    attendees: booking.attendees.map((attendee) => ({ email: attendee.email, noShow: true })),
    userId: ctx.user.id,
    locale: ctx.user.locale,
  });
};
