import { readonlyPrisma as prisma } from "@calcom/prisma";

type RepeatAttendee = {
  email: string;
  name: string;
  bookingCount: number;
};

export const getRepeatAttendees = async ({
  userId,
  minBookings,
}: {
  userId: number;
  minBookings: number;
}): Promise<RepeatAttendee[]> => {
  const attendees = await prisma.attendee.findMany({
    where: {
      booking: {
        userId,
      },
    },
    select: {
      email: true,
      name: true,
    },
  });

  const attendeesByEmail = new Map<string, RepeatAttendee>();
  for (const attendee of attendees) {
    const email = attendee.email.toLowerCase();
    const existing = attendeesByEmail.get(email);
    attendeesByEmail.set(email, {
      email,
      name: existing?.name ?? attendee.name,
      bookingCount: (existing?.bookingCount ?? 0) + 1,
    });
  }

  return Array.from(attendeesByEmail.values())
    .filter((attendee) => attendee.bookingCount >= minBookings)
    .sort((a, b) => b.bookingCount - a.bookingCount);
};
