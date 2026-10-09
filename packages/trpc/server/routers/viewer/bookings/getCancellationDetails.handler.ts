import { HttpError } from "@calcom/lib/http-error";
import { prisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import type { TrpcSessionUser } from "../../../types";
import type { TGetCancellationDetailsInputSchema } from "./getCancellationDetails.schema";

type GetCancellationDetailsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetCancellationDetailsInputSchema;
};

export const getCancellationDetailsHandler = async ({ ctx, input }: GetCancellationDetailsOptions) => {
  const booking = await prisma.booking.findFirst({
    where: {
      uid: input.bookingUid,
      userId: ctx.user.id,
      status: BookingStatus.CANCELLED,
    },
    select: {
      uid: true,
      cancellationReason: true,
      cancelledBy: true,
      updatedAt: true,
    },
  });

  if (!booking) {
    throw new HttpError({ statusCode: 404, message: "Cancelled booking not found" });
  }

  return booking;
};
