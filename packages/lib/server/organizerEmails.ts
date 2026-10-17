import prisma from "@calcom/prisma";

export async function getOrganizerEmails(bookingIds: number[]): Promise<string[]> {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    select: { user: { select: { email: true } } },
    take: 100,
  });
  return bookings.map((booking) => booking.user.email);
}
