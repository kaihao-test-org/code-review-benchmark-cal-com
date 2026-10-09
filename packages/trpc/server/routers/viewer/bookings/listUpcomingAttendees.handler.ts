import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TListUpcomingAttendeesInputSchema } from "./listUpcomingAttendees.schema";

type ListUpcomingAttendeesOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListUpcomingAttendeesInputSchema;
};

export const listUpcomingAttendeesHandler = async ({ ctx, input }: ListUpcomingAttendeesOptions) => {
  const { eventTypeId, limit, cursor } = input;

  const attendees = await prisma.attendee.findMany({
    where: {
      booking: {
        userId: ctx.user.id,
        status: BookingStatus.ACCEPTED,
        startTime: {
          gte: new Date(),
        },
        ...(eventTypeId ? { eventTypeId } : {}),
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      timeZone: true,
      booking: {
        select: {
          uid: true,
          title: true,
          startTime: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = attendees.length > limit;
  const page = hasMore ? attendees.slice(0, limit) : attendees;

  return {
    attendees: page,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
};
