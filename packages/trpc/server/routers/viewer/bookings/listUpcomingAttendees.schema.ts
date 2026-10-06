import { z } from "zod";

export const ZListUpcomingAttendeesInputSchema = z.object({
  eventTypeId: z.number().int().optional(),
  limit: z.number().int().min(1),
  cursor: z.number().int().optional(),
});

export type TListUpcomingAttendeesInputSchema = z.infer<typeof ZListUpcomingAttendeesInputSchema>;
