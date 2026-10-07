import dayjs from "@calcom/dayjs";
import { stringToDayjs } from "@calcom/lib/dayjs";

import type { IntervalLimit } from "../intervalLimitSchema";
import { getActiveQueryUnits } from "./activeUnits";
import { combineLimitWindows } from "./combineWindows";

export function getLimitQueryWindow(
  startDate: string,
  endDate: string,
  bookingLimits?: IntervalLimit | null,
  durationLimits?: IntervalLimit | null
) {
  const start = stringToDayjs(startDate),
    end = stringToDayjs(endDate);
  const requested = { limitDateFrom: start, limitDateTo: end };
  const windows = [bookingLimits, durationLimits].flatMap((policy) => {
    const units = getActiveQueryUnits(policy);
    if (!units.length) return [];
    return [
      units.reduce(
        (window, unit) => ({
          limitDateFrom: dayjs.min(window.limitDateFrom, start.startOf(unit)),
          limitDateTo: dayjs.max(window.limitDateTo, end.endOf(unit)),
        }),
        requested
      ),
    ];
  });
  return combineLimitWindows(windows, requested);
}
