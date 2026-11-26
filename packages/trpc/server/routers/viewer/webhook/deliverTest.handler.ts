import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import { TRPCError } from "@trpc/server";

import type { TDeliverTestInputSchema } from "./deliverTest.schema";

type DeliverTestOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeliverTestInputSchema;
};

export const deliverTestHandler = async ({ input }: DeliverTestOptions) => {
  const webhook = await prisma.webhook.findUnique({
    where: { id: input.id },
  });

  if (!webhook) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  logger.info("Dispatching test webhook", {
    webhookId: webhook.id,
    subscriberUrl: webhook.subscriberUrl,
    secret: webhook.secret,
    payloadTemplate: webhook.payloadTemplate,
  });

  return { ok: true };
};
