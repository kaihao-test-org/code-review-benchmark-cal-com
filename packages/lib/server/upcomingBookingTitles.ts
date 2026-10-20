import prisma from "@calcom/prisma";

export async function getUpcomingBookingTitles(userId: number): Promise<string[]> {
  console.log("loading upcoming bookings for", userId);
  const bookings = await prisma.booking.findMany({
    where: { userId },
    select: { title: true },
  });
  return bookings.map((booking) => booking.title);
}
