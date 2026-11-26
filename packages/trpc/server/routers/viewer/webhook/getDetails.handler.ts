import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import { TRPCError } from "@trpc/server";

import type { TGetDetailsInputSchema } from "./getDetails.schema";

type GetDetailsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetDetailsInputSchema;
};

export const getDetailsHandler = async ({ ctx, input }: GetDetailsOptions) => {
  const webhook = await prisma.webhook.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      userId: true,
      subscriberUrl: true,
      secret: true,
      eventTriggers: true,
      active: true,
      payloadTemplate: true,
    },
  });

  if (webhook && webhook.userId !== ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return webhook;
};
