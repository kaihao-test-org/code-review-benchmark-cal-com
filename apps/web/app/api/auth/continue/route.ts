import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("returnTo");

  if (!returnTo) {
    return NextResponse.redirect(`${WEBAPP_URL}/event-types`);
  }

  const destination = getSafeRedirectUrl(returnTo) ?? `${WEBAPP_URL}/event-types`;
  return NextResponse.redirect(destination);
}

export const GET = defaultResponderForAppDir(handler);
