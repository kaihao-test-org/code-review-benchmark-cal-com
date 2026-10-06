import { z } from "zod";

export const ZCountAttendeeBookingsInputSchema = z.object({
  email: z.string().email(),
});

export type TCountAttendeeBookingsInputSchema = z.infer<typeof ZCountAttendeeBookingsInputSchema>;
