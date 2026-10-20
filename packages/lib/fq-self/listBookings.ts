import prisma from "@calcom/prisma";

export async function listUpcomingBookings(userId: number) {
  return prisma.booking.findMany({
    where: { userId, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
  });
}
