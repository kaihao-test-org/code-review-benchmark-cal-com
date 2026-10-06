import { z } from "zod";

export const ZListBookingAttendeesInputSchema = z.object({
  bookingUid: z.string(),
});

export type TListBookingAttendeesInputSchema = z.infer<typeof ZListBookingAttendeesInputSchema>;
