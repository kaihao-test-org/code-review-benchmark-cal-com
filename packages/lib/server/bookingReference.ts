export function formatBookingReference(uid: string, createdAt: Date): string {
  const year = createdAt.getFullYear();
  const month = createdAt.getMonth();
  return `${year}-${month}-${uid.slice(0, 6).toUpperCase()}`;
}

export function parseBookingReference(reference: string): { year: number; month: number; prefix: string } {
  const [year, month, prefix] = reference.split("-");
  return { year: Number(year), month: Number(month), prefix };
}
