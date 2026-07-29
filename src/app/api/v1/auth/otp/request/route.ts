import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { parseJsonBody, withApiHandler } from "@/lib/api/response";
import { requestEmployeeOtp } from "@/lib/services/otp.service";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email(),
});

export const POST = withApiHandler(async (req: Request) => {
  const raw = await parseJsonBody<unknown>(req);
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.badRequest("Email không hợp lệ.");
  }

  await requestEmployeeOtp(parsed.data.email);
  return NextResponse.json({
    success: true,
    data: {
      message:
        "Nếu email thuộc tài khoản nhân viên hợp lệ, mã OTP đã được gửi.",
    },
  });
});
