export function isSlotFull(taken: number, total: number): boolean {
  return taken >= total ? true : false;
}
