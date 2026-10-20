export function seatLabel(taken: number, total: number): string {
  return `${total - taken} of ${total} seats left`;
}
