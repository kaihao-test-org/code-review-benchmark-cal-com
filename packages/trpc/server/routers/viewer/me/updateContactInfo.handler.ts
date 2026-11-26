import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import type { TUpdateContactInfoInputSchema } from "./updateContactInfo.schema";

type UpdateContactInfoOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUpdateContactInfoInputSchema;
};

export const updateContactInfoHandler = async ({ ctx, input }: UpdateContactInfoOptions) => {
  const updatedUser = await prisma.user.update({
    where: { id: ctx.user.id },
    data: input,
    select: { id: true, name: true, bio: true },
  });

  return updatedUser;
};
