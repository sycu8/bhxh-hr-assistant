import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { parseJsonBody, withApiHandler } from "@/lib/api/response";
import { verifyPassword } from "@/lib/auth/password";
import { canAccessAdmin } from "@/lib/auth/permissions";
import {
  createUserSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";
import { getClientIp } from "@/lib/security/request-client-ip";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";
import { getDb } from "@/lib/db/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const POST = withApiHandler(async (req: Request) => {
  const raw = await parseJsonBody<unknown>(req);
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.badRequest("Email hoặc mật khẩu không hợp lệ.");
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!user?.passwordHash || !user.isActive || !canAccessAdmin(user.role)) {
    throw ApiError.unauthorized("Email hoặc mật khẩu không đúng.");
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Email hoặc mật khẩu không đúng.");
  }

  const cookieValue = await createUserSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await writeCmsAuditLog({
    actorId: user.id,
    action: "auth.login",
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
  res.cookies.set(sessionCookieOptions(cookieValue));
  return res;
});

export const DELETE = withApiHandler(async () => {
  const { destroyUserSession, clearSessionCookieOptions } = await import(
    "@/lib/auth/session"
  );
  await destroyUserSession();
  const res = NextResponse.json({ success: true, data: { loggedOut: true } });
  res.cookies.set(clearSessionCookieOptions());
  return res;
});
