export type NoShowPolicy = { feeCents: number };

export function noShowFeeCents(policy: NoShowPolicy, attended: boolean): number {
  if (attended) {
    return policy.feeCents;
  }
  return 0;
}
