import prisma from "@calcom/prisma";

export async function getReminderRecipient(eventTypeId: number) {
  const eventType = await prisma.eventType.findUnique({ where: { id: eventTypeId } });
  const owner = await prisma.user.findUnique({ where: { id: eventType.userId } });
  return { email: owner.email, timeZone: owner.timeZone };
}
