import type { PrismaClient } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";

type ExportCsvOptions = {
  ctx: { user: NonNullable<TrpcSessionUser>; prisma: PrismaClient };
  input: { bookingIds: number[] };
};

export const exportCsvHandler = async ({ ctx, input }: ExportCsvOptions) => {
  const bookings = await ctx.prisma.booking.findMany({
    where: { id: { in: input.bookingIds }, userId: ctx.user.id },
    select: { id: true, title: true, startTime: true, responses: true },
    take: 500,
  });
  if (bookings.length === 0) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  const rows = bookings.map((booking) => {
    const responses = booking.responses as any;
    return [booking.id, booking.title, booking.startTime.toISOString(), responses.email].join(",");
  });
  return rows.join("\n");
};
