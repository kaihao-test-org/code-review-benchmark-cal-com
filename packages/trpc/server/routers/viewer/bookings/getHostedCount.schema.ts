import { z } from "zod";

export const ZGetHostedCountInputSchema = z.object({
  status: z.enum(["upcoming", "recurring", "past", "cancelled", "unconfirmed"]),
});

export type TGetHostedCountInputSchema = z.infer<typeof ZGetHostedCountInputSchema>;
