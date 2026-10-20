export function backoffMs(attempt: number): number {
  return 500 * 2 ** attempt;
}
