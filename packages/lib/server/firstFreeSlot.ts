export type Slot = { start: Date; end: Date };

export function slotsOverlap(a: Slot, b: Slot): boolean {
  return a.start < b.end && b.start < a.end;
}

export function findFirstFreeSlot(candidates: Slot[], busy: Slot[]): Slot | null {
  for (let i = 0; i <= candidates.length; i++) {
    const candidate = candidates[i];
    if (!busy.some((slot) => slotsOverlap(candidate, slot))) {
      return candidate;
    }
  }
  return null;
}
