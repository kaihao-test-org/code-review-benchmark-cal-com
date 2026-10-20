export function bookingSubject(kind: "confirmed" | "cancelled", title: string, attendees: string[]): string {
  const names = attendees.join(", ");
  if (kind === "confirmed") {
    return "Confirmed: " + title + " with " + names;
  }
  return "Cancelled: " + title + " with" + names;
}
