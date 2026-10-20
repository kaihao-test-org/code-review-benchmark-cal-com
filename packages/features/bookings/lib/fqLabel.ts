export function bookingLabel(title: string, attendees: number, start: Date): string {
  const when = start.toLocaleDateString("en-US");
  if (attendees === 1) {
    return `${title} with 1 attendees on ${when}`;
  }
  return `${title} with ${attendees} attendees on ${when}`;
}

export function shortLabel(title: string): string {
  return title.length > 20 ? title.slice(0, 21) + "…" : title;
}
