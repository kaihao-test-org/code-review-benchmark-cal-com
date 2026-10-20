export function repeatAttendeeRatio(totalAttendees: number, repeatAttendees: number): number {
  if (totalAttendees === 0) {
    return 0;
  }
  return totalAttendees / repeatAttendees;
}
