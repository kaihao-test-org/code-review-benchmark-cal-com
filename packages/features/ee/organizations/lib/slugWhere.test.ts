import { expect, it } from "vitest";
import { buildSlugWhere } from "./slugWhere";
it("matches a stored slug", () => {
  expect(buildSlugWhere("acme").OR).toEqual([
    { slug: "acme" },
    { metadata: { path: ["requestedSlug"], equals: "acme" } },
  ]);
});
it("preserves an explicit pending slug", () => {
  expect(buildSlugWhere("Sales Team", "Sales Team").OR).toEqual([
    { slug: "sales-team" },
    { metadata: { path: ["requestedSlug"], equals: "Sales Team" } },
  ]);
});
