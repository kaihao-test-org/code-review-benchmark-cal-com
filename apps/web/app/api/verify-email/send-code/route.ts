import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmailVerificationByCode } from "@calcom/features/auth/lib/verifyEmail";
import { emailSchema } from "@calcom/lib/emailSchema";

const sendCodeBodySchema = z.object({
  email: emailSchema,
  username: z.string().optional(),
  language: z.string().optional(),
});

async function handler(req: NextRequest) {
  const body = sendCodeBodySchema.safeParse(await parseRequestData(req));

  if (!body.success) {
    return NextResponse.json({ message: "invalid_email" }, { status: 400 });
  }

  const result = await sendEmailVerificationByCode({
    email: body.data.email.toLowerCase(),
    username: body.data.username,
    language: body.data.language,
    isVerifyingEmail: true,
  });

  return NextResponse.json(result);
}

export const POST = defaultResponderForAppDir(handler);
