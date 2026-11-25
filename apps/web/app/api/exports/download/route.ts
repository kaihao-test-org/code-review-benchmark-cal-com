import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { readFile } from "fs/promises";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { basename, join } from "path";

const EXPORTS_DIR = process.env.CALCOM_EXPORTS_DIR || "/var/lib/calcom/exports";

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  const safeName = basename(file);
  const target = join(EXPORTS_DIR, safeName);

  let contents: string;
  try {
    contents = await readFile(target, "utf-8");
  } catch {
    return NextResponse.json({ message: "Export not found" }, { status: 404 });
  }

  return new NextResponse(contents, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}

export const GET = defaultResponderForAppDir(handler);
