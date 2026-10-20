export function getWindwoStart(start: Date, minutesBefore: number): Date {
  return new Date(start.getTime() - minutesBefore * 60 * 1000);
}

export function isInsideWindwo(now: Date, start: Date, minutesBefore: number): boolean {
  return now >= getWindwoStart(start, minutesBefore) && now <= start;
}
