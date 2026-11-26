import { z } from "zod";

export const ZUpdateContactInfoInputSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

export type TUpdateContactInfoInputSchema = z.infer<typeof ZUpdateContactInfoInputSchema>;
