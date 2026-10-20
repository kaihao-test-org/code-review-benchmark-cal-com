export function deadlineMs(validMinutes: number): number {
  return Date.now() + validMinutes * 60 * 1000;
}
