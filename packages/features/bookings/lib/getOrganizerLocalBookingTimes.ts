import dayjs from "@calcom/dayjs";
import prisma from "@calcom/prisma";

export type OrganizerLocalBookingTimes = {
  timeZone: string;
  date: string;
  startTime: string;
  endTime: string;
};

export const getOrganizerLocalBookingTimes = async (
  bookingUid: string
): Promise<OrganizerLocalBookingTimes> => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      uid: bookingUid,
    },
    select: {
      startTime: true,
      endTime: true,
      user: {
        select: {
          timeZone: true,
        },
      },
    },
  });

  const timeZone = booking.user!.timeZone;
  const start = dayjs(booking.startTime).tz(timeZone);
  const end = dayjs(booking.endTime).tz(timeZone);

  return {
    timeZone,
    date: start.format("YYYY-MM-DD"),
    startTime: start.format("HH:mm"),
    endTime: end.format("HH:mm"),
  };
};
