import type { Prisma } from "@prisma/client";

import { getTranslation } from "@calcom/lib/server/i18n";
import { getTimeFormatStringFromUserTimeFormat } from "@calcom/lib/timeFormat";
import type { Person } from "@calcom/types/Calendar";

export const organizerBookingSelect = {
  userPrimaryEmail: true,
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      timeZone: true,
      locale: true,
      timeFormat: true,
    },
  },
} satisfies Prisma.BookingSelect;

export type BookingWithOrganizer = Prisma.BookingGetPayload<{ select: typeof organizerBookingSelect }>;

export const getOrganizerPersonFromBooking = async (booking: BookingWithOrganizer): Promise<Person> => {
  const organizer = booking.user!;
  const locale = organizer.locale ?? "en";

  return {
    id: organizer.id,
    name: organizer.name || organizer.username || "Nameless",
    email: booking.userPrimaryEmail ?? organizer.email,
    username: organizer.username ?? undefined,
    timeZone: organizer.timeZone,
    timeFormat: getTimeFormatStringFromUserTimeFormat(organizer.timeFormat),
    language: {
      translate: await getTranslation(locale, "common"),
      locale,
    },
  };
};
