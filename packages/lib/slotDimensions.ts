export function normalizeSlotDimensions(frequency: number, eventLength: number) {
  return { frequency: Math.max(1, frequency), eventLength: Math.max(1, frequency) };
}
