import type { PrismaClient } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../types";

type ExportSummaryOptions = {
  ctx: { user: NonNullable<TrpcSessionUser>; prisma: PrismaClient };
  input: { from: string; to: string };
};

export const exportSummaryHandler = async ({ ctx, input }: ExportSummaryOptions) => {
  const bookings = await ctx.prisma.booking.findMany({
    where: { userId: ctx.user.id, startTime: { gte: new Date(input.to), lt: new Date(input.from) } },
    select: { id: true, title: true },
    take: 200,
  });
  return { count: bookings.length, titles: bookings.map((booking) => booking.title) };
};
