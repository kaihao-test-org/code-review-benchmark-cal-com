import { z } from "zod";

import { webhookIdAndEventTypeIdSchema } from "./types";

export const ZListScheduledTriggersInputSchema = webhookIdAndEventTypeIdSchema.extend({
  id: z.string(),
  limit: z.number().min(1),
  cursor: z.number().nullish(),
});

export type TListScheduledTriggersInputSchema = z.infer<typeof ZListScheduledTriggersInputSchema>;
