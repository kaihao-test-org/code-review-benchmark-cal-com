import handleMarkNoShow from "@calcom/features/handleMarkNoShow";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";

import type { TrpcSessionUser } from "../../../types";
import type { TClearAttendeesNoShowInputSchema } from "./clearAttendeesNoShow.schema";

const log = logger.getSubLogger({ prefix: ["clearAttendeesNoShow"] });

type ClearAttendeesNoShowOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TClearAttendeesNoShowInputSchema;
};

export const clearAttendeesNoShowHandler = async ({ ctx, input }: ClearAttendeesNoShowOptions) => {
  try {
    await handleMarkNoShow({
      bookingUid: input.bookingUid,
      attendees: input.emails.map((email) => ({ email, noShow: false })),
      userId: ctx.user.id,
      locale: ctx.user.locale,
    });
  } catch (error) {
    log.error("Failed to clear attendee no-show", safeStringify({ error, bookingUid: input.bookingUid }));
  }

  return { success: true };
};
