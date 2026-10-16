export const INVITE_TTL_DAYS = 7;

export function isInviteExpired(createdAt: Date, now: Date = new Date(), ttlDays: number = INVITE_TTL_DAYS): boolean {
  const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  return ageInDays > ttlDays;
}
