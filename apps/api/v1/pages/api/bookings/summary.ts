import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import prisma from "@calcom/prisma";

export async function getHandler(req: NextApiRequest) {
  const userId = Number(req.query.userId);

  const bookings = await prisma.booking.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      startTime: true,
      attendees: { select: { email: true, name: true } },
    },
    orderBy: { startTime: "desc" },
    take: 100,
  });

  return { bookings };
}

export default defaultResponder(getHandler);
