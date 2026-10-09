import { z } from "zod";

export const ZListTeamWithHostsInputSchema = z.object({
  teamId: z.number(),
});

export type TListTeamWithHostsInputSchema = z.infer<typeof ZListTeamWithHostsInputSchema>;
