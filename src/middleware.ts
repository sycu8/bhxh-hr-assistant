import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CMS_SESSION_COOKIE,
  EMPLOYEE_SESSION_COOKIE,
} from "@/lib/auth/session-cookies";
import { verifySessionPayload } from "@/lib/auth/session-cookie";
import {
  canAccessAdmin,
  canAccessEmployeePortal,
  canAccessHrConsole,
} from "@/lib/auth/permissions";
import type { UserRole } from "@prisma/client";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";
import {
  checkAdminActionRateLimit,
  isAdminServerActionRequest,
  readAdminActionRateLimitConfig,
} from "@/lib/security/admin-action-rate-limit";
import { asRateLimitKv } from "@/lib/security/rate-limit-kv-adapter";
import {
  enforceLoginRateLimit,
  enforcePublicApiRateLimit,
  PUBLIC_API_RATE_LIMIT_PATHS,
} from "@/lib/security/edge-rate-limits";
import { asRateLimitKv } from "@/lib/security/rate-limit-kv-adapter";

const EMPLOYEE_PROTECTED_PREFIXES = [
  "/my-hr",
  "/time",
  "/pay",
  "/approvals",
] as const;

const HR_CONSOLE_PREFIX = "/hr";

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
    kv: asRateLimitKv(env?.APP_CACHE),
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

function readSessionPayload(request: NextRequest, cookieName: string) {
  const raw = request.cookies.get(cookieName)?.value;
  if (!raw) return null;

  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) return null;

  const signed = raw.slice(0, lastDot);
  return verifySessionPayload(signed);
}

function isEmployeeProtectedPath(pathname: string): boolean {
  return EMPLOYEE_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
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

  if (
    pathname === "/api/v1/auth/otp/request" ||
    pathname === "/api/v1/auth/otp/verify"
  ) {
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

  if (pathname.startsWith(HR_CONSOLE_PREFIX)) {
    const payload = await readSessionPayload(request, CMS_SESSION_COOKIE);
    const employeePayload = payload
      ? null
      : await readSessionPayload(request, EMPLOYEE_SESSION_COOKIE);
    const active = payload ?? employeePayload;

    if (!active) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!canAccessHrConsole(active.role as UserRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const rateLimited = await enforceAdminActionRateLimit(
      request,
      active.userId,
    );
    if (rateLimited) {
      return rateLimited;
    }

    return NextResponse.next();
  }

  if (isEmployeeProtectedPath(pathname)) {
    const payload = await readSessionPayload(request, EMPLOYEE_SESSION_COOKIE);
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessEmployeePortal(payload.role as UserRole)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const payload = await readSessionPayload(request, CMS_SESSION_COOKIE);
  if (!payload) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!canAccessAdmin(payload.role as UserRole)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const rateLimited = await enforceAdminActionRateLimit(
    request,
    payload.userId,
  );
  if (rateLimited) {
    return rateLimited;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hr",
    "/hr/:path*",
    "/my-hr",
    "/my-hr/:path*",
    "/time",
    "/time/:path*",
    "/pay",
    "/pay/:path*",
    "/approvals",
    "/approvals/:path*",
    "/api/auth/login",
    "/api/v1/auth/otp/:path*",
    "/api/search",
    "/api/ask",
    "/api/ask-hr/send",
  ],
};
