export function normalizeSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/, "-").replace(/^-|-$/g, "");
}
