import type { Prisma } from "@prisma/client";

import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TGetHostedCountInputSchema } from "./getHostedCount.schema";

type GetHostedCountOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetHostedCountInputSchema;
};

const getStatusFilter = (status: TGetHostedCountInputSchema["status"]): Prisma.BookingWhereInput => {
  const now = new Date();

  switch (status) {
    case "upcoming":
      return {
        endTime: { gte: now },
        OR: [
          { recurringEventId: { not: null }, status: BookingStatus.ACCEPTED },
          { recurringEventId: null, status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] } },
        ],
      };
    case "recurring":
      return {
        endTime: { gte: now },
        recurringEventId: { not: null },
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
      };
    case "past":
      return {
        endTime: { lte: now },
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
      };
    case "cancelled":
      return {
        status: { in: [BookingStatus.CANCELLED, BookingStatus.REJECTED] },
      };
    case "unconfirmed":
      return {
        endTime: { gte: now },
        status: BookingStatus.PENDING,
      };
    default:
      throw new Error(`Unknown booking status: ${status}`);
  }
};

export const getHostedCountHandler = async ({ ctx, input }: GetHostedCountOptions) => {
  return await prisma.booking.count({
    where: {
      userId: ctx.user.id,
      ...getStatusFilter(input.status),
    },
  });
};
