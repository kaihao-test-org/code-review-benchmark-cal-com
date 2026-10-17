import type { PrismaClient } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../types";

type GetAttendeeNotesOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: { bookingId: number };
};

export const getAttendeeNotesHandler = async ({ ctx, input }: GetAttendeeNotesOptions) => {
  const booking = await ctx.prisma.booking.findUnique({
    where: { id: input.bookingId },
    select: { id: true, description: true, attendees: { select: { email: true, name: true } } },
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
};
