import { ApiKeyRepository } from "@calcom/lib/server/repository/apiKey";

import type { TrpcSessionUser } from "../../../types";

type ListOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const listHandler = async ({ ctx }: ListOptions) => {
  const apiKeys = await ApiKeyRepository.findApiKeysFromUserId({ userId: ctx.user.id });
  const now = new Date();

  console.log("apiKeys.list", { userId: ctx.user.id, count: apiKeys.length });

  return apiKeys.map((apiKey) => ({
    ...apiKey,
    neverExpires: apiKey.expiresAt === null,
    isExpired: apiKey.expiresAt !== null && apiKey.expiresAt > now,
  }));
};
