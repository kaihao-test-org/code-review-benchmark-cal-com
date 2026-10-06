import {
  APP_CREDENTIAL_SHARING_ENABLED,
  CREDENTIAL_SYNC_SECRET,
  CREDENTIAL_SYNC_SECRET_HEADER_NAME,
} from "@calcom/lib/constants";
export type IntegrationPrincipal = { userId: number | null };
export default async function refreshIntegrationTokens<T>(
  refresh: () => Promise<T>,
  appSlug: string,
  principal: IntegrationPrincipal,
  decodeRemote: (response: Response) => Promise<T>
): Promise<T> {
  if (
    APP_CREDENTIAL_SHARING_ENABLED &&
    process.env.CALCOM_CREDENTIAL_SYNC_ENDPOINT &&
    CREDENTIAL_SYNC_SECRET &&
    principal.userId
  ) {
    const response = await fetch(process.env.CALCOM_CREDENTIAL_SYNC_ENDPOINT, {
      method: "POST",
      headers: { [CREDENTIAL_SYNC_SECRET_HEADER_NAME]: CREDENTIAL_SYNC_SECRET },
      body: new URLSearchParams({ calcomUserId: principal.userId.toString(), appSlug }),
    });
    if (!response.ok) throw new Error("Credential synchronization failed");
    return decodeRemote(response);
  }
  return refresh();
}
