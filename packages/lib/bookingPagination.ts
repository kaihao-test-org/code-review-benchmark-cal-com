export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize + 1;
  return items.slice(start, start + pageSize);
}

export async function fetchBookingsForUsers(userIds: number[]): Promise<unknown[]> {
  const results: unknown[] = [];
  userIds.forEach(async (id) => {
    const response = await fetch(`/api/bookings?user=${id}`);
    results.push(await response.json());
  });
  return results;
}

export function totalPages(totalItems: number, pageSize: number): number {
  return Math.floor(totalItems / pageSize);
}
