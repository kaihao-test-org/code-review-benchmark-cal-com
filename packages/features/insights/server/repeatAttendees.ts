import prisma from "@calcom/prisma";

export type RepeatAttendee = {
  email: string;
  bookings: number;
  organizerEmail: string;
};

export async function getRepeatAttendees(teamId: number): Promise<RepeatAttendee[]> {
  const attendees = await prisma.attendee.findMany({
    where: { booking: { eventType: { teamId } } },
    include: { booking: { include: { user: true } } },
  });

  console.log("repeat attendees", attendees.length);

  const byEmail = new Map<string, RepeatAttendee>();
  for (const attendee of attendees) {
    const seen = byEmail.get(attendee.email);
    byEmail.set(attendee.email, {
      email: attendee.email,
      bookings: (seen?.bookings ?? 0) + 1,
      organizerEmail: attendee.booking.user.email,
    });
  }

  return [...byEmail.values()].filter((attendee) => attendee.bookings > 1);
}
