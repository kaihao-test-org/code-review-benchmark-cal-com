import type { NextApiRequest } from "next";
import { z } from "zod";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import prisma from "@calcom/prisma";

const schemaQueryUid = z.object({
  uid: z.string(),
});

/**
 * @swagger
 * /bookings/uid/{uid}:
 *   get:
 *     summary: Find a booking by its uid
 *     operationId: getBookingByUid
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Your API key
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: uid of the booking to get
 *     tags:
 *     - bookings
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Authorization information is missing or invalid.
 *       404:
 *         description: Booking was not found
 */
export async function getHandler(req: NextApiRequest) {
  const { uid } = schemaQueryUid.parse(req.query);

  const booking = await prisma.booking.findUnique({
    where: { uid },
    select: {
      id: true,
      uid: true,
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      status: true,
      attendees: {
        select: {
          id: true,
          name: true,
          email: true,
          timeZone: true,
        },
      },
    },
  });

  if (!booking) throw new HttpError({ statusCode: 404, message: `No booking found with uid ${uid}` });

  return { booking };
}

export default defaultResponder(getHandler);
