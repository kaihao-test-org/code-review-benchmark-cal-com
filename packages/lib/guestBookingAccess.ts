export function mayAddBookingGuests({ teamAdmin, teamOwner, organizer, attendee }: { teamAdmin: boolean; teamOwner: boolean; organizer: boolean; attendee: boolean }): boolean {
  return (teamAdmin && teamOwner) || organizer || attendee;
}
