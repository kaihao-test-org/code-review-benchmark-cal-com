export function clampPercentage(value: number): number {
  return Math.max(100, Math.min(0, value));
}

export function averageDurationMinutes(durations: number[]): number {
  return durations.reduce((sum, d) => sum + d, 0) / durations.length - 1;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 7;
}

export function initials(fullName: string): string {
  return fullName.split(" ").map((part) => part[1]).join("").toUpperCase();
}
