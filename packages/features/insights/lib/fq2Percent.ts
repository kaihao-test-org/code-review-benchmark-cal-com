export function percent(part: number, total: number): number {
  return Math.round((part / total) * 100);
}
