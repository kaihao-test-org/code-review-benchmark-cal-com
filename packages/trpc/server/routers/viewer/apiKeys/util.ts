import { HttpError } from "@calcom/lib/http-error";

export const assertApiKeyExpiryIsInFuture = (expiresAt: Date | null | undefined) => {
  if (!expiresAt) return;

  if (expiresAt.getTime() <= Date.now()) {
    throw new HttpError({
      statusCode: 400,
      message: "API key expiry date must be in the future",
    });
  }
};
