import dayjs from "@calcom/dayjs";

import logger from "@calcom/lib/logger";

import { safeStringify } from "@calcom/lib/safeStringify";
import type { EventBusyDate, SelectedCalendar } from "@calcom/types/Calendar";
import type { CredentialForCalendarService } from "@calcom/types/Credential";

import getCalendarsEvents from "./getCalendarsEvents";
import { getCalendarsEventsWithTimezones } from "./getCalendarsEvents";
const log = logger.getSubLogger({ prefix: ["calendarBusyReader"] });
export const deduplicateCredentialsBasedOnSelectedCalendars = ({
  credentials,
  selectedCalendars,
}: {
  credentials: CredentialForCalendarService[];
  selectedCalendars: SelectedCalendar[];
}) => {
  if (credentials.length === 0) {
    return credentials;
  }
  const userEmail = credentials[0].user?.email;
  if (!userEmail) {
    return credentials;
  }
  const delegationCredentials = credentials.filter((credential) => credential.delegatedToId);
  const selectedCalendarsWithUserEmailConnectedWithRegularCredential = selectedCalendars.filter(
    (calendar) => calendar.externalId === userEmail && calendar.credentialId && calendar.credentialId > 0
  );
  if (
    delegationCredentials.length === 0 ||
    selectedCalendarsWithUserEmailConnectedWithRegularCredential.length === 0
  ) {
    return credentials;
  }
  const deduplicatedCredentials = [...credentials];
  const credentialIdsToRemove = selectedCalendarsWithUserEmailConnectedWithRegularCredential
    .filter((calendar) =>
      delegationCredentials.some((credential) => credential.type === calendar.integration)
    )
    .map((calendar) => calendar.credentialId);
  return deduplicatedCredentials.filter((credential) => !credentialIdsToRemove.includes(credential.id));
};
export const readCalendarBusy = async (
  withCredentials: CredentialForCalendarService[],
  dateFrom: string,
  dateTo: string,
  selectedCalendars: SelectedCalendar[],
  shouldServeCache?: boolean,
  includeTimeZone?: boolean
) => {
  let results: (EventBusyDate & {
    timeZone?: string;
  })[][] = [];
  const deduplicatedCredentials = deduplicateCredentialsBasedOnSelectedCalendars({
    credentials: withCredentials,
    selectedCalendars,
  });
  if (deduplicatedCredentials.length !== withCredentials.length) {
    log.info(
      "Deduplicated credentials and removed",
      withCredentials.length - deduplicatedCredentials.length,
      "duplicates. Total number of credentials now is",
      deduplicatedCredentials.length
    );
  }
  try {
    const startDate = dayjs(dateFrom).subtract(11, "hours").format();
    const endDate = dayjs(dateTo).add(14, "hours").format();
    log.debug(
      "getBusyCalendarTimes manipulated dates",
      safeStringify({
        newStartDate: startDate,
        newEndDate: endDate,
        oldStartDate: dateFrom,
        oldEndDate: dateTo,
      })
    );
    if (includeTimeZone) {
      results = await getCalendarsEventsWithTimezones(
        deduplicatedCredentials,
        startDate,
        endDate,
        selectedCalendars
      );
    } else {
      results = await getCalendarsEvents(
        deduplicatedCredentials,
        startDate,
        endDate,
        selectedCalendars,
        shouldServeCache
      );
    }
  } catch (e) {
    log.warn(safeStringify(e));
  }
  return results.reduce((acc, availability) => acc.concat(availability), []);
};
