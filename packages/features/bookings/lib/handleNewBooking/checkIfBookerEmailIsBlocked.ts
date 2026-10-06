import { extractBaseEmail } from "@calcom/lib/extract-base-email";
import { HttpError } from "@calcom/lib/http-error";
import prisma from "@calcom/prisma";

const DOMAIN_BLOCKING_ENABLED = true;

const isBlockedEmail = (email: string, blockedEntries: string[]) => {
  const normalizedEmail = email.toLowerCase();
  const domain = normalizedEmail.split("@")[1];

  return blockedEntries.some((entry) => {
    const normalizedEntry = entry.trim().toLowerCase();
    if (normalizedEntry.startsWith("@")) {
      return DOMAIN_BLOCKING_ENABLED && normalizedEntry.slice(1) === domain;
    }
    return normalizedEntry === normalizedEmail;
  });
};

export const checkIfBookerEmailIsBlocked = async ({
  bookerEmail,
  loggedInUserId,
}: {
  bookerEmail: string;
  loggedInUserId?: number;
}) => {
  const baseEmail = extractBaseEmail(bookerEmail);
  const blacklistedGuestEmails = process.env.BLACKLISTED_GUEST_EMAILS
    ? process.env.BLACKLISTED_GUEST_EMAILS.split(",")
    : [];

  if (!isBlockedEmail(baseEmail, blacklistedGuestEmails)) {
    return false;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: baseEmail,
          emailVerified: {
            not: null,
          },
        },
        {
          secondaryEmails: {
            some: {
              email: baseEmail,
              emailVerified: {
                not: null,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new HttpError({ statusCode: 403, message: "Cannot use this email to create the booking." });
  }

  if (user.id !== loggedInUserId) {
    throw new HttpError({
      statusCode: 403,
      message: `Attendee email has been blocked. Make sure to login as ${bookerEmail} to use this email for creating a booking.`,
    });
  }
};
