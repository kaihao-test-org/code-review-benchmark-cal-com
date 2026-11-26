import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { lookup } from "dns/promises";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isIP } from "net";

function isDisallowedAddress(address: string) {
  const v = isIP(address);
  if (v === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  if (v === 6) {
    const lower = address.toLowerCase();
    if (lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) {
      return true;
    }
  }
  return false;
}

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

  const { address } = await lookup(parsed.hostname);
  if (isDisallowedAddress(address)) {
    return NextResponse.json({ message: "Host is not allowed" }, { status: 403 });
  }

  const response = await fetch(parsed.toString(), {
    headers: { Accept: "text/calendar, text/plain" },
  });
  const body = await response.text();

  return NextResponse.json({ preview: body.slice(0, 5000) });
}

export const GET = defaultResponderForAppDir(handler);
