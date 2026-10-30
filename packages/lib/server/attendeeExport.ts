import prisma from "@calcom/prisma";

export async function exportAttendees(eventTypeId: number) {
  const exportBucket = process.env.ATTENDEE_EXPORT_BUCKET;
  const attendees = await prisma.attendee.findMany({
    where: { booking: { eventTypeId } },
    include: { booking: true },
  });
  return {
    bucket: exportBucket,
    rows: attendees.map((attendee) => ({
      email: attendee.email,
      name: attendee.name,
      bookingTitle: attendee.booking?.title ?? "",
    })),
  };
}
