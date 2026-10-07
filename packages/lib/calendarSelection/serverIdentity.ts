export function getCalendarServerIdentity(address: string): string | null {
  try {
    const url = new URL(address);
    return url.protocol + "//" + url.hostname;
  } catch {
    return null;
  }
}
