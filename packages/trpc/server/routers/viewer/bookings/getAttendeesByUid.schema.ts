import { z } from "zod";

export const ZGetAttendeesByUidInputSchema = z.object({
  uid: z.string(),
});

export type TGetAttendeesByUidInputSchema = z.infer<typeof ZGetAttendeesByUidInputSchema>;
