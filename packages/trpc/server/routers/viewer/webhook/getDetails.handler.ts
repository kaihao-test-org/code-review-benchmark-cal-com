import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import type { TGetDetailsInputSchema } from "./getDetails.schema";

type GetDetailsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetDetailsInputSchema;
};

export const getDetailsHandler = async ({ input }: GetDetailsOptions) => {
  const webhook = await prisma.webhook.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      subscriberUrl: true,
      secret: true,
      eventTriggers: true,
      active: true,
      payloadTemplate: true,
    },
  });

  return webhook;
};
