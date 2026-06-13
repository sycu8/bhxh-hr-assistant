import type { NextRequest } from "next/server";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";
import {
  checkKvRateLimit,
  rateLimit429Response,
  readRateLimitConfigFromEnv,
  type RateLimitConfig,
} from "@/lib/security/kv-rate-limit";
import { getClientIp } from "@/lib/security/request-client-ip";

const LOGIN_DEFAULTS: RateLimitConfig = { max: 10, windowSec: 900 };
const PUBLIC_API_DEFAULTS: RateLimitConfig = { max: 30, windowSec: 60 };
const ASK_HR_DEFAULTS: RateLimitConfig = { max: 5, windowSec: 900 };

function kvFromEnv() {
  return tryGetCloudflareEnv()?.APP_CACHE;
}

export async function enforceLoginRateLimit(
  request: NextRequest,
): Promise<Response | null> {
  if (request.method !== "POST") return null;
  const config = readRateLimitConfigFromEnv(
    "LOGIN_RATE_LIMIT_MAX",
    "LOGIN_RATE_LIMIT_WINDOW_SEC",
    LOGIN_DEFAULTS,
  );
  const ip = getClientIp(request);
  const result = await checkKvRateLimit({
    storageKey: `login-rate:${ip}`,
    config,
    kv: kvFromEnv(),
  });
  if (result.allowed) return null;
  return rateLimit429Response(
    result.retryAfterSec,
    "Đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
  );
}

export async function enforcePublicApiRateLimit(
  request: NextRequest,
  pathname: string,
): Promise<Response | null> {
  if (request.method !== "POST") return null;

  const isAskHr = pathname === "/api/ask-hr/send";
  const defaults = isAskHr ? ASK_HR_DEFAULTS : PUBLIC_API_DEFAULTS;
  const config = isAskHr
    ? readRateLimitConfigFromEnv(
        "ASK_HR_RATE_LIMIT_MAX",
        "ASK_HR_RATE_LIMIT_WINDOW_SEC",
        defaults,
      )
    : readRateLimitConfigFromEnv(
        "PUBLIC_API_RATE_LIMIT_MAX",
        "PUBLIC_API_RATE_LIMIT_WINDOW_SEC",
        defaults,
      );

  const ip = getClientIp(request);
  const routeKey = pathname.replace(/\//g, ":");
  const result = await checkKvRateLimit({
    storageKey: `public-api:${routeKey}:${ip}`,
    config,
    kv: kvFromEnv(),
  });
  if (result.allowed) return null;
  return rateLimit429Response(
    result.retryAfterSec,
    "Yêu cầu quá nhanh. Vui lòng thử lại sau vài phút.",
  );
}

export const PUBLIC_API_RATE_LIMIT_PATHS = new Set([
  "/api/search",
  "/api/ask",
  "/api/ask-hr/send",
]);
