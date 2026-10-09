import type { NextApiRequest } from "next";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server/defaultResponder";
import prisma from "@calcom/prisma";

import {
  schemaAvailabilityEditBodyParams,
  schemaAvailabilityReadPublic,
} from "~/lib/validations/availability";
import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

/**
 * @swagger
 * /availabilities/{id}:
 *   patch:
 *     operationId: editAvailabilityById
 *     summary: Edit an existing availability
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         description: Your API key
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the availability to edit
 *     requestBody:
 *       description: Edit an existing availability related to one of your bookings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: array
 *                 description: Array of integers depicting weekdays
 *                 items:
 *                   type: integer
 *                   enum: [0, 1, 2, 3, 4, 5]
 *               scheduleId:
 *                 type: integer
 *                 description: ID of schedule this availability is associated with
 *               startTime:
 *                 type: string
 *                 description: Start time of the availability
 *               endTime:
 *                 type: string
 *                 description: End time of the availability
 *           examples:
 *              availability:
 *                summary: An example of availability
 *                value:
 *                  scheduleId: 123
 *                  days: [1,2,3,5]
 *                  startTime: 1970-01-01T17:00:00.000Z
 *                  endTime: 1970-01-01T17:00:00.000Z
 *
 *     tags:
 *     - availabilities
 *     externalDocs:
 *        url: https://docs.cal.com/docs/core-features/availability
 *     responses:
 *       201:
 *         description: OK, availability edited successfully
 *       400:
 *        description: Bad request. Availability body is invalid.
 *       401:
 *        description: Authorization information is missing or invalid.
 */
export async function patchHandler(req: NextApiRequest) {
  const { query, body } = req;
  const { id } = schemaQueryIdParseInt.parse(query);
  const data = schemaAvailabilityEditBodyParams.parse(body);
  if (data.days) {
    const invalidDays = data.days.filter((day) => !Number.isInteger(day) || day < 0 || day > 6);
    if (invalidDays.length > 0) {
      throw new HttpError({
        statusCode: 400,
        message: `Invalid days: ${invalidDays.join(", ")}. Days must be integers from 0 (Sunday) to 6 (Saturday).`,
      });
    }
    if (new Set(data.days).size !== data.days.length) {
      throw new HttpError({ statusCode: 400, message: "Days must not contain duplicates." });
    }
  }
  const availability = await prisma.availability.update({
    where: { id },
    data,
    include: { Schedule: { select: { userId: true } } },
  });
  return { availability: schemaAvailabilityReadPublic.parse(availability) };
}

export default defaultResponder(patchHandler);
