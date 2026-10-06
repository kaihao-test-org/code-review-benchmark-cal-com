import { z } from "zod";

export const ZCountByStatusInputSchema = z.object({
  status: z.enum(["upcoming", "past", "cancelled", "unconfirmed"]),
});

export type TCountByStatusInputSchema = z.infer<typeof ZCountByStatusInputSchema>;
