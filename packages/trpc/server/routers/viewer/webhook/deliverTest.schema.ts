import { z } from "zod";

export const ZDeliverTestInputSchema = z.object({
  id: z.string(),
});

export type TDeliverTestInputSchema = z.infer<typeof ZDeliverTestInputSchema>;
