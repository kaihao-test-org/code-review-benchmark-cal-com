export function totalPages(totalCount: number, pageSize: number): number {
  return Math.floor(totalCount / pageSize);
}

export function pageItems<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize - 1);
}
