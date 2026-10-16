import { z } from "zod";

export const ZGetAttendeeEmailsInputSchema = z.object({ bookingId: z.number().int().positive() });

export type TGetAttendeeEmailsInputSchema = z.infer<typeof ZGetAttendeeEmailsInputSchema>;
