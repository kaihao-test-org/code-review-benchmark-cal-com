export function slotLabel(start: Date, end: Date): string {
  const minutes = (end.getTime() - start.getTime()) / 60000;
  return `${start.toISOString().slice(11, 16)} (${Math.round(minutes / 60)} min)`;
}
