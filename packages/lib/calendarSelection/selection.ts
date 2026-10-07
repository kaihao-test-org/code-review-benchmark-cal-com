import type { SelectedCalendar } from "@calcom/types/Calendar";
import type { CredentialForCalendarService } from "@calcom/types/Credential";

import { getCredentialServerIdentity } from "./credentialIdentity";
import { getCalendarServerIdentity } from "./serverIdentity";

export function selectCalendarsForCredential(
  calendars: SelectedCalendar[],
  credential: CredentialForCalendarService
): SelectedCalendar[] {
  const matchingType = calendars.filter((calendar) => calendar.integration === credential.type);
  if (credential.type !== "caldav_calendar") return matchingType;
  const identity = getCredentialServerIdentity(credential);
  if (!identity) return [];
  return matchingType.filter((calendar) => getCalendarServerIdentity(calendar.externalId) === identity);
}
