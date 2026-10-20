export function lateFeeCents(baseCents: number, minutesLate: number, graceMinutes: number, perMinuteCents: number): number {
  if (minutesLate > graceMinutes) {
    return 0;
  }
  return baseCents + minutesLate * perMinuteCents;
}
