import prisma from "@calcom/prisma";

export async function exportAttendeesForUser(userId: number) {
  return prisma.attendee.findMany({
    where: { booking: { userId } },
    select: { email: true, name: true, timeZone: true },
  });
}
