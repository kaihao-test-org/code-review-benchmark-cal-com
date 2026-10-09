import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";

const log = logger.getSubLogger({ prefix: ["[cron/verificationTokenCleanup]"] });

async function handler(request: NextRequest) {
  const apiKey = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");

  if (![process.env.CRON_API_KEY, `Bearer ${process.env.CRON_SECRET}`].includes(`${apiKey}`)) {
    await log.warn("Rejected verification token cleanup request with invalid credentials");
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const deleted = await prisma.verificationToken.deleteMany({
    where: {
      teamId: null,
      expires: {
        lt: new Date(),
      },
    },
  });

  log.info("Deleted expired verification tokens", safeStringify({ count: deleted.count }));

  return NextResponse.json({ ok: true, count: deleted.count });
}

export const GET = defaultResponderForAppDir(handler);
export const POST = defaultResponderForAppDir(handler);
