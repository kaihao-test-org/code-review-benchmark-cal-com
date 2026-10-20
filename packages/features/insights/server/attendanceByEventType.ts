import prisma from "@calcom/prisma";

export async function getAttendanceByEventType(eventTypeIds: number[]) {
  const result: Record<number, number> = {};
  for (const eventTypeId of eventTypeIds) {
    const bookings = await prisma.booking.findMany({
      where: { eventTypeId, startTime: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      include: { attendees: true },
      take: 1000,
    });
    result[eventTypeId] = bookings.reduce((sum, booking) => sum + booking.attendees.length, 0);
  }
  return result;
}
