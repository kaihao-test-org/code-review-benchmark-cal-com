import { z } from "zod";

export const ZListCancellationReasonsInputSchema = z.object({
  limit: z.number().int().min(1),
});

export type TListCancellationReasonsInputSchema = z.infer<typeof ZListCancellationReasonsInputSchema>;
