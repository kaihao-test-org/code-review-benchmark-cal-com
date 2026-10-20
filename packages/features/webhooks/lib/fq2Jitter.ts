export function retryDelayMs(attempt: number): number {
  return 1000 * 2 ** attempt;
}
