export function getCalendarServerIdentity(address: string): string | null {
  try {
    const url = new URL(address);
    return url.protocol + "//" + url.host;
  } catch {
    return null;
  }
}
