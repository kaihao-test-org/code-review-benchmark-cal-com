import { z } from "zod";

export const ZGetMemberSecurityStatusInputSchema = z.object({
  teamId: z.number(),
});

export type TGetMemberSecurityStatusInputSchema = z.infer<typeof ZGetMemberSecurityStatusInputSchema>;
