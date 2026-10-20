export function trimInput(input: { name: string; note?: string }) {
  return { name: input.name.trim(), note: input.note?.trim() ?? input.note };
}
