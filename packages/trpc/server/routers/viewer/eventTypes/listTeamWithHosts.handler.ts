import { EventTypeRepository } from "@calcom/lib/server/repository/eventTypeRepository";
import { prisma } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../types";
import type { TListTeamWithHostsInputSchema } from "./listTeamWithHosts.schema";

type ListTeamWithHostsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListTeamWithHostsInputSchema;
};

export const listTeamWithHostsHandler = async ({ ctx, input }: ListTeamWithHostsOptions) => {
  const membership = await prisma.membership.findFirst({
    where: {
      teamId: input.teamId,
      userId: ctx.user.id,
      accepted: true,
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  const eventTypeRepo = new EventTypeRepository(prisma);
  return await eventTypeRepo.findAllByTeamIdWithHosts({ teamId: input.teamId });
};
