import prisma from "@calcom/prisma";

export async function exportBookingsForUser(userId: number) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    select: { id: true, title: true, startTime: true, endTime: true },
  });
  return bookings.map((booking) => ({
    ...booking,
    durationMinutes: (booking.endTime.getTime() - booking.startTime.getTime()) / 60000,
  }));
}
