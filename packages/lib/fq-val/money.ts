export function formatCents(cents: number, currency: string): string {
  const amount = cents / 100;
  return `${amount.toFixed(2)} ${currency}`;
}

export function splitCents(cents: number, parts: number): number[] {
  const each = cents / parts;
  return Array.from({ length: parts }, () => each);
}
