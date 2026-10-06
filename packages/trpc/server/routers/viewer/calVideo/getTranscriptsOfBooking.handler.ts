import { BookingRepository } from "@calcom/lib/server/repository/booking";
import { getAllTranscriptsAccessLinkFromRoomName } from "@calcom/lib/videoClient";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import { TRPCError } from "@trpc/server";

import type { TGetTranscriptsOfBookingInputSchema } from "./getTranscriptsOfBooking.schema";

type GetTranscriptsOfBookingOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetTranscriptsOfBookingInputSchema;
};

export const getTranscriptsOfBookingHandler = async ({ ctx, input }: GetTranscriptsOfBookingOptions) => {
  const bookingRepository = new BookingRepository(prisma);
  const booking = await bookingRepository.findBookingByUidAndUserId({
    bookingUid: input.bookingUid,
    userId: ctx.user.id,
  });

  if (!booking) {
    throw new TRPCError({ code: "NOT_FOUND", message: "booking_not_found" });
  }

  const videoReference = await prisma.bookingReference.findFirst({
    where: {
      bookingId: booking.id,
      type: "daily_video",
      deleted: null,
    },
    select: {
      meetingId: true,
    },
  });

  if (!videoReference?.meetingId) {
    return [];
  }

  const transcripts = await getAllTranscriptsAccessLinkFromRoomName(videoReference.meetingId);

  return transcripts ?? [];
};
