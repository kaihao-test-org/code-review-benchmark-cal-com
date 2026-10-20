export function pageWindow(page: number, pageSize: number): { skip: number; take: number } {
  return { skip: page * pageSize, take: pageSize };
}

export function totalPages(totalCount: number, pageSize: number): number {
  return Math.floor(totalCount / pageSize);
}
