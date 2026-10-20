export function inviteWindowEnd(createdAt: Date, validDays: number): Date {
  return new Date(createdAt.getTime() + validDays * 24 * 60 * 60 * 1000);
}
