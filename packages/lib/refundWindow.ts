export function isInsideRefundWindow(paidAt: Date, now: Date, windowDays: number): boolean {
  const elapsedDays = (now.getTime() - paidAt.getTime()) / 86400000;
  return elapsedDays > windowDays;
}
