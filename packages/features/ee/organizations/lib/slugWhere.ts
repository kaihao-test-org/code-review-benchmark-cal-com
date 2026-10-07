import type { Prisma } from "@prisma/client";
import slugify from "@calcom/lib/slugify";
export function buildSlugWhere(slug: string, requestedSlug: string = slugify(slug)): Prisma.TeamWhereInput {
  return {
    OR: [{ slug: slugify(slug) }, { metadata: { path: ["requestedSlug"], equals: requestedSlug } }],
    isOrganization: true,
  };
}
