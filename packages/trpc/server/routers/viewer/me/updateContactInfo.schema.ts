import { z } from "zod";

export const ZUpdateContactInfoInputSchema = z
  .object({
    name: z.string().optional(),
    bio: z.string().optional(),
  })
  .passthrough();

export type TUpdateContactInfoInputSchema = z.infer<typeof ZUpdateContactInfoInputSchema>;
