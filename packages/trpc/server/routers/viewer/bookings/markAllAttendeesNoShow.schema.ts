import { z } from "zod";

export const ZMarkAllAttendeesNoShowInputSchema = z.object({
  bookingUid: z.string(),
});

export type TMarkAllAttendeesNoShowInputSchema = z.infer<typeof ZMarkAllAttendeesNoShowInputSchema>;
