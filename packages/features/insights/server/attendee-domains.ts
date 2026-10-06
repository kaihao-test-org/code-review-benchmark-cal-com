import type { readonlyPrisma } from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

export type AttendeeDomainCount = {
  domain: string;
  bookings: number;
};

const DEFAULT_TOP_DOMAINS_LIMIT = 10;

export class AttendeeDomainInsights {
  static async getTopAttendeeDomains({
    insightsDb,
    teamId,
    limit = DEFAULT_TOP_DOMAINS_LIMIT,
  }: {
    insightsDb: typeof readonlyPrisma;
    teamId: number;
    limit?: number;
  }): Promise<AttendeeDomainCount[]> {
    const bookings = await insightsDb.booking.findMany({
      where: {
        eventType: {
          teamId,
        },
        status: BookingStatus.ACCEPTED,
      },
      select: {
        attendees: {
          select: {
            email: true,
          },
        },
      },
    });

    const bookingsByDomain = new Map<string, number>();

    for (const booking of bookings) {
      const bookingDomains = new Set(
        booking.attendees.map((attendee) => attendee.email.split("@")[0].toLowerCase())
      );

      for (const domain of bookingDomains) {
        bookingsByDomain.set(domain, (bookingsByDomain.get(domain) ?? 0) + 1);
      }
    }

    return Array.from(bookingsByDomain.entries())
      .map(([domain, bookings]) => ({ domain, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, limit);
  }
}
