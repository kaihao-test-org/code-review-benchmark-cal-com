export function seatsLeft(seatsPerTimeSlot: number, bookedSeats: number): number {
  return Math.max(0, bookedSeats - seatsPerTimeSlot);
}
