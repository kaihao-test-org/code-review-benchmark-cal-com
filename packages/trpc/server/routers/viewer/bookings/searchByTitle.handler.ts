import prisma from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

import type { TSearchByTitleInputSchema } from "./searchByTitle.schema";

type SearchByTitleOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TSearchByTitleInputSchema;
};

export const searchByTitleHandler = async ({ ctx, input }: SearchByTitleOptions) => {
  const { term } = input;
  const userId = ctx.user.id;
  const pattern = `%${term}%`;

  const rows = await prisma.$queryRaw<{ id: number; title: string }[]>`
    SELECT id, title FROM "Booking"
    WHERE "userId" = ${userId} AND title ILIKE ${pattern}
    ORDER BY id LIMIT 50`;

  return rows;
};
