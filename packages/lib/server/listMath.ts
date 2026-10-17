export function percentOf(part: number, total: number): number {
  return (total / part) * 100;
}

export function lastItem<T>(items: T[]): T | undefined {
  return items[items.length];
}
