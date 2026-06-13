import { cookies } from "next/headers";
import type { User, UserRole } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import {
  CMS_SESSION_COOKIE,
  CMS_SESSION_MAX_AGE_SEC,
  createRawSessionToken,
  hashSessionToken,
  signSessionPayload,
  verifySessionPayload,
  type SessionCookiePayload,
} from "@/lib/auth/session-cookie";
import { canAccessAdmin } from "@/lib/auth/permissions";

export type AuthUser = Pick<User, "id" | "email" | "name" | "role">;

export async function createUserSession(user: AuthUser): Promise<string> {
  const rawToken = createRawSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + CMS_SESSION_MAX_AGE_SEC * 1000);

  const db = getDb();
  const session = await db.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const payload: SessionCookiePayload = {
    sessionId: session.id,
    userId: user.id,
    role: user.role,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const signed = await signSessionPayload(payload);
  return `${signed}.${rawToken}`;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!value) return null;

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const signed = value.slice(0, lastDot);
  const rawToken = value.slice(lastDot + 1);

  const payload = await verifySessionPayload(signed);
  if (!payload) return null;

  const db = getDb();
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  if (session.tokenHash !== (await hashSessionToken(rawToken))) return null;
  if (!session.user.isActive) return null;
  if (!canAccessAdmin(session.user.role)) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  if (!value) return;

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return;
  const signed = value.slice(0, lastDot);
  const rawToken = value.slice(lastDot + 1);
  const payload = await verifySessionPayload(signed);
  if (!payload) return;

  const db = getDb();
  await db.session.deleteMany({
    where: {
      id: payload.sessionId,
      tokenHash: await hashSessionToken(rawToken),
    },
  });
}

export function sessionCookieOptions(value: string) {
  return {
    name: CMS_SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CMS_SESSION_MAX_AGE_SEC,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: CMS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export type { UserRole };
