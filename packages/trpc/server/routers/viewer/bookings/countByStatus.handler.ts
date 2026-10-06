import type { Prisma } from "@prisma/client";

import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";
import type { TCountByStatusInputSchema } from "./countByStatus.schema";

type CountByStatusOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCountByStatusInputSchema;
};

const getStatusWhere = (status: TCountByStatusInputSchema["status"], now: Date): Prisma.BookingWhereInput => {
  switch (status) {
    case "upcoming":
      return { endTime: { gte: now }, status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } };
    case "past":
      return { endTime: { lte: now }, status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } };
    case "cancelled":
      return { status: { in: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } };
    case "unconfirmed":
      return { endTime: { gte: now }, status: BookingStatus.PENDING };
    default:
      throw new TRPCError({ code: "BAD_REQUEST", message: `Unsupported status: ${status}` });
  }
};

export const countByStatusHandler = async ({ ctx, input }: CountByStatusOptions) => {
  const count = await prisma.booking.count({
    where: {
      userId: ctx.user.id,
      ...getStatusWhere(input.status, new Date()),
    },
  });

  return { status: input.status, count };
};
