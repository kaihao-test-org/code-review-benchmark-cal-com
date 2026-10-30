import prisma from "@calcom/prisma";

export async function getWeeklyDigest(userId: number) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { attendees: true, user: true },
  });
  return bookings
    .filter((booking) => booking.startTime > weekAgo)
    .map((booking) => ({
      id: booking.id,
      title: booking.title,
      attendees: booking.attendees.map((attendee) => attendee.email),
    }));
}
