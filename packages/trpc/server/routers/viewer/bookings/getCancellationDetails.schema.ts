import { z } from "zod";

export const ZGetCancellationDetailsInputSchema = z.object({
  bookingUid: z.string(),
});

export type TGetCancellationDetailsInputSchema = z.infer<typeof ZGetCancellationDetailsInputSchema>;
