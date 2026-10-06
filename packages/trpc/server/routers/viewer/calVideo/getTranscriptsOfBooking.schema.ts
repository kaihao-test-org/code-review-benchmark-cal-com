import { z } from "zod";

export const ZGetTranscriptsOfBookingInputSchema = z.object({
  bookingUid: z.string(),
});

export type TGetTranscriptsOfBookingInputSchema = z.infer<typeof ZGetTranscriptsOfBookingInputSchema>;
