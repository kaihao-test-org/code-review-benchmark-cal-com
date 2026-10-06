import prisma from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../types";
import type { TEditInputSchema } from "./edit.schema";
import { assertApiKeyExpiryIsInFuture } from "./util";

type EditOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TEditInputSchema;
};

export const editHandler = async ({ ctx, input }: EditOptions) => {
  const { id, ...data } = input;

  assertApiKeyExpiryIsInFuture(data.expiresAt);

  const {
    apiKeys: [updatedApiKey],
  } = await prisma.user.update({
    where: {
      id: ctx.user.id,
    },
    data: {
      apiKeys: {
        update: {
          where: {
            id,
          },
          data,
        },
      },
    },
    select: {
      apiKeys: {
        where: {
          id,
        },
      },
    },
  });

  return updatedApiKey;
};
