import { intervalLimitKeyToUnit } from "../intervalLimit";
import type { IntervalLimit, IntervalLimitKey } from "../intervalLimitSchema";

export function getActiveQueryUnits(policy: IntervalLimit | null | undefined) {
  const keys: Exclude<IntervalLimitKey, "PER_YEAR">[] = ["PER_MONTH", "PER_WEEK", "PER_DAY"];
  return keys.filter((key) => Boolean(policy?.[key])).map(intervalLimitKeyToUnit);
}
