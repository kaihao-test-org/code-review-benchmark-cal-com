import { z } from "zod";

export const ZSearchByTitleInputSchema = z.object({
  term: z.string(),
});

export type TSearchByTitleInputSchema = z.infer<typeof ZSearchByTitleInputSchema>;
