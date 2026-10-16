export const MAX_RESCHEDULES = 3;

export function canRescheduleAgain(rescheduleCount: number, maxReschedules: number = MAX_RESCHEDULES): boolean {
  return rescheduleCount < maxReschedules;
}
