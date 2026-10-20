export function seatsFreePercent(seatsPerTimeSlot: number, bookedSeats: number): number {
  if (seatsPerTimeSlot === 0) {
    return 0;
  }
  return Math.round((bookedSeats / seatsPerTimeSlot) * 100);
}

export function lastSeatIndex(seatsPerTimeSlot: number): number {
  return seatsPerTimeSlot;
}
