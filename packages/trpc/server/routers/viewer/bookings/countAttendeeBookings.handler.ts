import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TCountAttendeeBookingsInputSchema } from "./countAttendeeBookings.schema";

type CountAttendeeBookingsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TCountAttendeeBookingsInputSchema;
};

export const countAttendeeBookingsHandler = async ({ ctx, input }: CountAttendeeBookingsOptions) => {
  const count = await prisma.booking.count({
    where: {
      userId: ctx.user.id,
      status: BookingStatus.ACCEPTED,
      attendees: {
        some: {
          email: input.email,
        },
      },
    },
  });

  return { count };
};
