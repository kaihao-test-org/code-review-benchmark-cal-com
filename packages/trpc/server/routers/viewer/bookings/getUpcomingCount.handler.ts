import { HttpError } from "@calcom/lib/http-error";
import { prisma } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../types";

type GetUpcomingCountOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getUpcomingCountHandler = async ({ ctx }: GetUpcomingCountOptions) => {
  if (ctx.user.locked) {
    throw new HttpError({ statusCode: 403, message: "Your account is locked" });
  }

  return prisma.booking.count({
    where: { userId: ctx.user.id, startTime: { gte: new Date() } },
  });
};
