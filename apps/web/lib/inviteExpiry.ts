export function inviteExpiresAt(createdAt: Date, validDays: number): Date {
  return new Date(createdAt.getTime() + validDays * 24 * 60 * 60 * 1000);
}

export function isInviteExpired(createdAt: Date, validDays: number): boolean {
  return Date.now() > inviteExpiresAt(createdAt, validDays).getTime();
}
