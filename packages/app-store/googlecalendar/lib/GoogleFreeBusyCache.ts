import type { calendar_v3 } from "@googleapis/calendar";

import { CalendarCache } from "@calcom/features/calendar-cache/calendar-cache";
import type { FreeBusyArgs } from "@calcom/features/calendar-cache/calendar-cache.repository.interface";
import { getTimeMax, getTimeMin } from "@calcom/features/calendar-cache/lib/datesForCache";
import type {
  EventBusyDate,
  IntegrationCalendar,
  SelectedCalendarEventTypeIds,
} from "@calcom/types/Calendar";
import type { CredentialForCalendarServiceWithEmail } from "@calcom/types/Credential";

export class GoogleFreeBusyCache {
  constructor(private credential: Pick<CredentialForCalendarServiceWithEmail, "id" | "userId">) {}

  async read(args: FreeBusyArgs) {
    const calendarCache = await CalendarCache.init(null);
    return await calendarCache.getCachedAvailability({
      credentialId: this.credential.id,
      userId: this.credential.userId,
      args: {
        timeMin: getTimeMin(args.timeMin),
        timeMax: getTimeMax(args.timeMax),
        items: args.items,
      },
    });
  }

  async write(args: FreeBusyArgs, data: calendar_v3.Schema$FreeBusyResponse): Promise<void> {
    const calendarCache = await CalendarCache.init(null);
    await calendarCache.upsertCachedAvailability({
      credentialId: this.credential.id,
      userId: this.credential.userId,
      args,
      value: JSON.parse(JSON.stringify(data)),
    });
  }

  static toCalendarBusyTimes(freeBusyResult: calendar_v3.Schema$FreeBusyResponse): EventBusyDate[] {
    if (!freeBusyResult.calendars) return [];

    return Object.values(freeBusyResult.calendars).flatMap(
      (calendar) =>
        calendar.busy?.map((busyTime) => ({
          start: busyTime.start || "",
          end: busyTime.end || "",
        })) || []
    );
  }

  static groupSelectedCalendarsByEventTypeId(selectedCalendars: IntegrationCalendar[]) {
    const selectedCalendarsPerEventType = new Map<
      SelectedCalendarEventTypeIds[number],
      IntegrationCalendar[]
    >();

    selectedCalendars.reduce((acc, selectedCalendar) => {
      const eventTypeId = selectedCalendar.eventTypeId ?? null;
      const mapValue = selectedCalendarsPerEventType.get(eventTypeId);
      if (mapValue) {
        mapValue.push(selectedCalendar);
      } else {
        acc.set(eventTypeId, [selectedCalendar]);
      }
      return acc;
    }, selectedCalendarsPerEventType);

    return selectedCalendarsPerEventType;
  }
}
