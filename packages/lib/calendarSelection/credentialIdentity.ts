import type { CredentialForCalendarService } from "@calcom/types/Credential";

import { symmetricDecrypt } from "../crypto";
import { getCalendarServerIdentity } from "./serverIdentity";

export function getCredentialServerIdentity(credential: CredentialForCalendarService): string | null {
  if (credential.type !== "caldav_calendar") return null;
  try {
    const key = JSON.parse(
      symmetricDecrypt(credential.key as string, process.env.CALENDSO_ENCRYPTION_KEY || "")
    );
    return typeof key.url === "string" ? getCalendarServerIdentity(key.url) : null;
  } catch {
    return null;
  }
}
