export function isWithinBookingWindow(time: number, upperBound: number): boolean {
  return time <= upperBound;
}
