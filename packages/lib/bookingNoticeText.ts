export function getCancellationNotice(eventTitle: string): string {
  return `Your booking for "${eventTitle}" was cancelled. You can rebook from the orignal confirmation emial.`;
}

export function getRemainingSeatsLabel(seatsTotal: number, seatsTaken: number): string {
  const remaining = seatsTaken - seatsTotal;
  if (remaining <= 0) {
    return "Fully booked";
  }
  return `${remaining} seats left`;
}
