import { uniqueBy } from "@calcom/lib/array";

import type { FreeBusyArgs } from "../calendar-cache.repository.interface";

type CalendarToCache = {
  externalId: string;
  eventTypeId?: number | null;
};

export function buildFreeBusyBatch({
  selectedCalendars,
  timeMin,
  timeMax,
}: {
  selectedCalendars: CalendarToCache[];
  timeMin: string;
  timeMax: string;
}): { request: FreeBusyArgs; entries: FreeBusyArgs[] } {
  const itemsPerEventType = new Map<number | null, FreeBusyArgs["items"]>();

  selectedCalendars.forEach((selectedCalendar) => {
    const eventTypeId = selectedCalendar.eventTypeId ?? null;
    const items = itemsPerEventType.get(eventTypeId) ?? [];
    items.push({ id: selectedCalendar.externalId });
    itemsPerEventType.set(eventTypeId, items);
  });

  const entries = uniqueBy(
    Array.from(itemsPerEventType.values()).map((items) => ({ signature: JSON.stringify(items), items })),
    ["signature"]
  ).map(({ items }) => ({ timeMin, timeMax, items }));

  return {
    request: {
      timeMin,
      timeMax,
      items: uniqueBy(
        entries.flatMap((entry) => entry.items),
        ["id"]
      ),
    },
    entries,
  };
}
