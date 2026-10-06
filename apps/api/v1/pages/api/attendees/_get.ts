import type { Prisma } from "@prisma/client";
import type { NextApiRequest } from "next";
import { z } from "zod";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import prisma from "@calcom/prisma";

import { schemaAttendeeReadPublic } from "~/lib/validations/attendee";

const schemaQueryBookingUid = z.object({
  bookingUid: z.string().optional(),
});

/**
 * @swagger
 * /attendees:
 *   get:
 *     operationId: listAttendees
 *     summary: Find all attendees
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Your API key
 *       - in: query
 *         name: bookingUid
 *         required: false
 *         schema:
 *           type: string
 *         description: Only return attendees of the booking with this uid
 *     tags:
 *     - attendees
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *       404:
 *         description: No attendees were found
 */
async function handler(req: NextApiRequest) {
  const { userId, isSystemWideAdmin } = req;
  const { bookingUid } = schemaQueryBookingUid.parse(req.query);

  if (bookingUid && !isSystemWideAdmin) {
    const userBooking = await prisma.booking.findFirst({
      where: { userId, uid: bookingUid },
      select: { id: true },
    });
    if (!userBooking) throw new HttpError({ statusCode: 403, message: "Forbidden" });
  }

  const args: Prisma.AttendeeFindManyArgs = bookingUid
    ? { where: { booking: { uid: bookingUid } } }
    : isSystemWideAdmin
    ? {}
    : { where: { booking: { userId } } };
  const data = await prisma.attendee.findMany(args);
  const attendees = data.map((attendee) => schemaAttendeeReadPublic.parse(attendee));
  if (!attendees) throw new HttpError({ statusCode: 404, message: "No attendees were found" });
  return { attendees };
}

export default defaultResponder(handler);
