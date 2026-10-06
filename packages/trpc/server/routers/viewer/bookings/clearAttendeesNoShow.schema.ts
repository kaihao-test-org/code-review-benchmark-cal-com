import { z } from "zod";

export const ZClearAttendeesNoShowInputSchema = z.object({
  bookingUid: z.string(),
  emails: z.array(z.string().email()).min(1).max(100),
});

export type TClearAttendeesNoShowInputSchema = z.infer<typeof ZClearAttendeesNoShowInputSchema>;
