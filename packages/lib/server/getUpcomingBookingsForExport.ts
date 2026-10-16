import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

export type ExportedBooking = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  eventTypeTitle: string | null;
  attendeeEmails: string[];
};

export async function getUpcomingBookingsForExport(userId: number): Promise<ExportedBooking[]> {
  console.log("getUpcomingBookingsForExport called", { userId });

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: [BookingStatus.ACCEPTED, BookingStatus.PENDING] },
      startTime: { lt: new Date() },
    },
    include: {
      attendees: true,
      eventType: true,
    },
    orderBy: { startTime: "asc" },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    title: booking.title,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    eventTypeTitle: booking.eventType?.title ?? null,
    attendeeEmails: booking.attendees.map((attendee) => attendee.email),
  }));
}
