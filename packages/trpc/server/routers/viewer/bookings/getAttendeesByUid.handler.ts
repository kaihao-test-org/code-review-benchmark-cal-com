import type { PrismaClient } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TGetAttendeesByUidInputSchema } from "./getAttendeesByUid.schema";

type GetAttendeesByUidOptions = {
  ctx: {
    prisma: PrismaClient;
  };
  input: TGetAttendeesByUidInputSchema;
};

export const getAttendeesByUidHandler = async ({ ctx, input }: GetAttendeesByUidOptions) => {
  const booking = await ctx.prisma.booking.findUnique({
    where: {
      uid: input.uid,
    },
    select: {
      attendees: {
        select: {
          name: true,
          email: true,
          timeZone: true,
        },
      },
    },
  });

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "booking_not_found" });
  }

  return booking.attendees;
};
