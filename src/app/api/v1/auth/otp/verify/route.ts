import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { parseJsonBody, withApiHandler } from "@/lib/api/response";
import {
  createEmployeeSession,
  employeeSessionCookieOptions,
} from "@/lib/auth/employee-session";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";
import { getClientIp } from "@/lib/security/request-client-ip";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";
import { verifyEmployeeOtp } from "@/lib/services/otp.service";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().min(4).max(8),
});

export const POST = withApiHandler(async (req: Request) => {
  const raw = await parseJsonBody<unknown>(req);
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.badRequest("Email hoặc mã OTP không hợp lệ.");
  }

  const user = await verifyEmployeeOtp(parsed.data.email, parsed.data.code);
  if (!user) {
    throw ApiError.unauthorized("Mã OTP không đúng hoặc đã hết hạn.");
  }

  const cookieValue = await createEmployeeSession(user);

  await writeCmsAuditLog({
    actorId: user.id,
    action: "auth.employee_login",
    entityType: "User",
    entityId: user.id,
    ipAddress: getClientIp(req),
  });

  const res = NextResponse.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  });
  res.cookies.set(employeeSessionCookieOptions(cookieValue));
  return res;
});

export const DELETE = withApiHandler(async () => {
  const { destroyEmployeeSession, clearEmployeeSessionCookieOptions } =
    await import("@/lib/auth/employee-session");
  await destroyEmployeeSession();
  const res = NextResponse.json({ success: true, data: { loggedOut: true } });
  res.cookies.set(clearEmployeeSessionCookieOptions());
  return res;
});
