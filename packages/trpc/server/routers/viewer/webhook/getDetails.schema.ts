import { z } from "zod";

export const ZGetDetailsInputSchema = z.object({
  id: z.string(),
});

export type TGetDetailsInputSchema = z.infer<typeof ZGetDetailsInputSchema>;
