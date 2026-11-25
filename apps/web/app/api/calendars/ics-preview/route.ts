import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ message: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ message: "Unsupported protocol" }, { status: 400 });
  }

  const response = await fetch(parsed.toString(), {
    headers: { Accept: "text/calendar, text/plain" },
  });
  const body = await response.text();

  return NextResponse.json({ preview: body.slice(0, 5000) });
}

export const GET = defaultResponderForAppDir(handler);
