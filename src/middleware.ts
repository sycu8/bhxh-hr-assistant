import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CMS_SESSION_COOKIE,
  verifySessionPayload,
} from "@/lib/auth/session-cookie";
import { canAccessAdmin } from "@/lib/auth/permissions";
import type { UserRole } from "@prisma/client";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";
import {
  checkAdminActionRateLimit,
  isAdminServerActionRequest,
  readAdminActionRateLimitConfig,
} from "@/lib/security/admin-action-rate-limit";
import {
  enforceLoginRateLimit,
  enforcePublicApiRateLimit,
  PUBLIC_API_RATE_LIMIT_PATHS,
} from "@/lib/security/edge-rate-limits";

async function enforceAdminActionRateLimit(
  request: NextRequest,
  userId: string,
): Promise<NextResponse | null> {
  if (!isAdminServerActionRequest(request)) {
    return null;
  }

  const env = tryGetCloudflareEnv();
  const result = await checkAdminActionRateLimit({
    key: userId,
    config: readAdminActionRateLimitConfig(),
    kv: env?.APP_CACHE,
  });

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    {
      error: {
        message:
          "Thao tác quá nhanh. Vui lòng chờ vài giây rồi thử lại.",
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec),
      },
    },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/auth/login") {
    const blocked = await enforceLoginRateLimit(request);
    if (blocked) {
      return NextResponse.json(await blocked.json(), {
        status: blocked.status,
        headers: blocked.headers,
      });
    }
    return NextResponse.next();
  }

  if (PUBLIC_API_RATE_LIMIT_PATHS.has(pathname)) {
    const blocked = await enforcePublicApiRateLimit(request, pathname);
    if (blocked) {
      return NextResponse.json(await blocked.json(), {
        status: blocked.status,
        headers: blocked.headers,
      });
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const raw = request.cookies.get(CMS_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const signed = raw.slice(0, lastDot);
  const payload = await verifySessionPayload(signed);
  if (!payload) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!canAccessAdmin(payload.role as UserRole)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rateLimited = await enforceAdminActionRateLimit(request, payload.userId);
  if (rateLimited) {
    return rateLimited;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/auth/login",
    "/api/search",
    "/api/ask",
    "/api/ask-hr/send",
  ],
};
