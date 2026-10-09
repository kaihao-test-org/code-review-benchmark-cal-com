import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendEmailVerificationByCode } from "@calcom/features/auth/lib/verifyEmail";
import { emailSchema } from "@calcom/lib/emailSchema";

const sendEmailCodeBodySchema = z.object({
  email: emailSchema,
  username: z.string().optional(),
  language: z.string().optional(),
  isVerifyingEmail: z.boolean().optional(),
});

async function handler(req: NextRequest) {
  const body = await parseRequestData(req);
  const parsedBody = sendEmailCodeBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ message: "invalid_request_body" }, { status: 400 });
  }

  const { email, username, language, isVerifyingEmail } = parsedBody.data;

  const result = await sendEmailVerificationByCode({
    email: email.toLowerCase(),
    username,
    language,
    isVerifyingEmail,
  });

  return NextResponse.json(result);
}

export const POST = defaultResponderForAppDir(handler);
