import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TListCancellationReasonsInputSchema } from "./listCancellationReasons.schema";

type ListCancellationReasonsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListCancellationReasonsInputSchema;
};

export const listCancellationReasonsHandler = async ({ ctx, input }: ListCancellationReasonsOptions) => {
  return await prisma.booking.findMany({
    where: {
      userId: ctx.user.id,
      status: BookingStatus.CANCELLED,
      cancellationReason: {
        not: null,
      },
    },
    select: {
      uid: true,
      title: true,
      startTime: true,
      cancellationReason: true,
      cancelledBy: true,
    },
    orderBy: {
      startTime: "desc",
    },
    take: input.limit,
  });
};
