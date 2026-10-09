import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import type { TListScheduledTriggersInputSchema } from "./listScheduledTriggers.schema";

type ListScheduledTriggersOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListScheduledTriggersInputSchema;
};

export const listScheduledTriggersHandler = async ({ ctx: _ctx, input }: ListScheduledTriggersOptions) => {
  const { id, limit, cursor } = input;

  const triggers = await prisma.webhookScheduledTriggers.findMany({
    where: {
      webhookId: id,
    },
    select: {
      id: true,
      startAfter: true,
      retryCount: true,
      createdAt: true,
      bookingId: true,
    },
    orderBy: {
      id: "asc",
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = triggers.length > limit;
  const items = hasMore ? triggers.slice(0, limit) : triggers;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
};
