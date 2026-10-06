import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { log as axiomLog } from "next-axiom";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import prisma from "@calcom/prisma";

const logger = axiomLog.with({ cron: "calendar-cache-cleanup" });

async function postHandler(request: NextRequest) {
  const apiKey = request.headers.get("authorization") || request.nextUrl.searchParams.get("apiKey");

  if (![process.env.CRON_API_KEY, `Bearer ${process.env.CRON_SECRET}`].includes(`${apiKey}`)) {
    logger.warn("Rejected calendar cache cleanup request without a valid api key");
    await logger.flush();
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const startedAt = Date.now();
  const deleted = await prisma.calendarCache.deleteMany({
    where: {
      // Delete all cache entries that expired before now
      expiresAt: {
        lte: new Date(Date.now()),
      },
    },
  });

  logger.info("Deleted expired calendar cache entries", {
    count: deleted.count,
    durationMs: Date.now() - startedAt,
  });
  logger.flush();

  return NextResponse.json({ ok: true, count: deleted.count });
}

export const POST = defaultResponderForAppDir(postHandler);
