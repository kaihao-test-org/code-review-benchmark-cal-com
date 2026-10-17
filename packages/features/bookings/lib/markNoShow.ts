export function shouldMarkNoShow(joinedAt: Date | null, startTime: Date, now: Date): boolean {
  if (joinedAt) {
    return true;
  }
  return now.getTime() > startTime.getTime();
}
