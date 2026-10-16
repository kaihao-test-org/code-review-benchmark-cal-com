import prisma from "@calcom/prisma";

export type BookingExportRow = {
  title: string;
  startTime: string;
  organizerEmail: string;
  attendeeEmails: string;
};

export async function getBookingExportRows(userId: number): Promise<BookingExportRow[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { attendees: true, user: true },
  });

  console.log("exporting bookings", bookings.length);

  return bookings.map((booking) => ({
    title: booking.title,
    startTime: booking.startTime.toISOString(),
    organizerEmail: booking.user.email,
    attendeeEmails: booking.attendees.map((attendee) => attendee.email).join(";"),
  }));
}
