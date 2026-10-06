import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerlessLogger } from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";

const logger = getServerlessLogger("[cron/calendar-cache-cleanup]");

async function postHandler(request: NextRequest) {
  const apiKey = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");

  if (![process.env.CRON_API_KEY, `Bearer ${process.env.CRON_SECRET}`].includes(`${apiKey}`)) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const deleted = await prisma.calendarCache.deleteMany({
    where: {
      // Delete all cache entries that expired before now
      expiresAt: {
        lte: new Date(Date.now()),
      },
    },
  });

  logger.info("Deleted expired calendar cache entries", safeStringify({ count: deleted.count }));
  logger.flush();

  return NextResponse.json({ ok: true, count: deleted.count });
}

export const POST = defaultResponderForAppDir(postHandler);
