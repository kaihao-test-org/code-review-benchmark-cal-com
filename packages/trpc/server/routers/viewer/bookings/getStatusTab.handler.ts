import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";
import type { TGetStatusTabInputSchema } from "./getStatusTab.schema";

type GetStatusTabOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetStatusTabInputSchema;
};

const getStatusTab = (status: BookingStatus, endTime: Date, now: Date) => {
  switch (status) {
    case BookingStatus.CANCELLED:
    case BookingStatus.REJECTED:
      return "cancelled";
    case BookingStatus.PENDING:
      return endTime >= now ? "unconfirmed" : "past";
    case BookingStatus.ACCEPTED:
      return endTime >= now ? "upcoming" : "past";
  }
};

export const getStatusTabHandler = async ({ ctx, input }: GetStatusTabOptions) => {
  const booking = await prisma.booking.findFirst({
    where: {
      uid: input.bookingUid,
      userId: ctx.user.id,
    },
    select: {
      status: true,
      endTime: true,
    },
  });

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "booking_not_found" });
  }

  return { tab: getStatusTab(booking.status, booking.endTime, new Date()) };
};
