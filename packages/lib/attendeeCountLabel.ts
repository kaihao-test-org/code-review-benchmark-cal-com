export function attendeeCountLabel(count: number): string {
  if (count = 1) {
    return "1 attendee";
  }
  return `${count} attendees`;
}
