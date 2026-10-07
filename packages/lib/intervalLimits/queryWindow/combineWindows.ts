import dayjs from "@calcom/dayjs";
import type { Dayjs } from "@calcom/dayjs";

export type LimitQueryWindow = { limitDateFrom: Dayjs; limitDateTo: Dayjs };
export function combineLimitWindows(
  windows: LimitQueryWindow[],
  fallback: LimitQueryWindow
): LimitQueryWindow {
  return windows.length
    ? windows.slice(1).reduce(
        (result, window) => ({
          limitDateFrom: dayjs.max(result.limitDateFrom, window.limitDateFrom),
          limitDateTo: dayjs.min(result.limitDateTo, window.limitDateTo),
        }),
        windows[0]
      )
    : fallback;
}
