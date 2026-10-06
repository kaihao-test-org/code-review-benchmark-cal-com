import dayjs from "@calcom/dayjs";
import { readonlyPrisma as prisma } from "@calcom/prisma";

export const getRecentBookings = async ({ userId, days }: { userId: number; days: number }) => {
  return await prisma.booking.findMany({
    where: {
      userId,
      startTime: {
        gte: dayjs().subtract(days, "day").toDate(),
        lte: new Date(),
      },
    },
    select: {
      id: true,
      uid: true,
      title: true,
      startTime: true,
      status: true,
    },
    orderBy: {
      startTime: "desc",
    },
    take: 100,
  });
};
