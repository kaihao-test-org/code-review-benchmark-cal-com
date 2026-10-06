import { z } from "zod";

export const ZGetStatusTabInputSchema = z.object({
  bookingUid: z.string(),
});

export type TGetStatusTabInputSchema = z.infer<typeof ZGetStatusTabInputSchema>;
