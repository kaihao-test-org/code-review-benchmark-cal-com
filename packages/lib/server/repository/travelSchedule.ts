import { prisma } from "@calcom/prisma";

export class TravelScheduleRepository {
  static async findTravelSchedulesByUserId(userId: number) {
    const allTravelSchedules = await prisma.travelSchedule.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        timeZone: true,
      },
    });

    return allTravelSchedules;
  }

  static async findUpcomingTravelSchedulesByUserId(userId: number) {
    return await prisma.travelSchedule.findMany({
      where: {
        userId,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        timeZone: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }
}
