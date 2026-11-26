import { checkAdminOrOwner } from "@calcom/features/auth/lib/checkAdminOrOwner";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import { TRPCError } from "@trpc/server";

import type { TGetMemberSecurityStatusInputSchema } from "./getMemberSecurityStatus.schema";

type Options = {
  ctx: { user: NonNullable<TrpcSessionUser> };
  input: TGetMemberSecurityStatusInputSchema;
};

export default async function handler({ ctx, input }: Options) {
  const { teamId } = input;

  const callerMembership = await prisma.membership.findFirst({
    where: { teamId, userId: ctx.user.id, accepted: true },
  });

  if (!callerMembership || !checkAdminOrOwner(callerMembership.role)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const memberships = await prisma.membership.findMany({
    where: { teamId, accepted: true },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          backupCodes: true,
          password: { select: { hash: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({ role: m.role, ...m.user }));
}
