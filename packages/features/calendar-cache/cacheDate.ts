export function toCacheDate(milliseconds: number): Date {
  return new Date(milliseconds | 0);
}
