import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

const MAX_DIGEST_BOOKINGS = 200;

export type TeamBookingDigestItem = {
  uid: string;
  title: string;
  startTime: Date;
  endTime: Date;
  organizerName: string | null;
  organizerEmail: string | null;
};

export async function getTeamUpcomingBookingsDigest({
  teamId,
  from,
  to,
}: {
  teamId: number;
  from: Date;
  to: Date;
}): Promise<TeamBookingDigestItem[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      eventType: {
        teamId,
      },
      status: BookingStatus.ACCEPTED,
      startTime: {
        gte: from,
        lt: to,
      },
    },
    select: {
      uid: true,
      title: true,
      startTime: true,
      endTime: true,
      userId: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: MAX_DIGEST_BOOKINGS,
  });

  const digest: TeamBookingDigestItem[] = [];

  for (const booking of bookings) {
    const organizer = booking.userId
      ? await prisma.user.findUnique({
          where: { id: booking.userId },
          select: { name: true, email: true },
        })
      : null;

    digest.push({
      uid: booking.uid,
      title: booking.title,
      startTime: booking.startTime,
      endTime: booking.endTime,
      organizerName: organizer?.name ?? null,
      organizerEmail: organizer?.email ?? null,
    });
  }

  return digest;
}
