import { z } from "zod";

export const ZGetRoleInputSchema = z.object({
  teamId: z.number(),
  roleId: z.string(),
});

export type TGetRoleInputSchema = z.infer<typeof ZGetRoleInputSchema>;
