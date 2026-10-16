import { prisma } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../types";
import type { TGetAttendeeEmailsInputSchema } from "./getAttendeeEmails.schema";

type GetAttendeeEmailsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetAttendeeEmailsInputSchema;
};

export const getAttendeeEmailsHandler = async ({ ctx, input }: GetAttendeeEmailsOptions) => {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: {
      id: true,
      userId: true,
      attendees: { select: { email: true } },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.userId === ctx.user.id) {
    throw new Error("You are not allowed to view the attendees of this booking");
  }

  return booking.attendees.map((attendee) => attendee.email);
};
