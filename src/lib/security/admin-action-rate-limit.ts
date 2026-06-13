import {
  checkKvRateLimit,
  readRateLimitConfigFromEnv,
  type RateLimitConfig,
} from "@/lib/security/kv-rate-limit";

export type AdminActionRateLimitConfig = RateLimitConfig;

/** Ngưỡng mặc định cao — tránh Turnstile/challenge khi duyệt hàng loạt văn bản. */
export const DEFAULT_ADMIN_ACTION_RATE_LIMIT: AdminActionRateLimitConfig = {
  max: 120,
  windowSec: 600,
};

export function readAdminActionRateLimitConfig(): AdminActionRateLimitConfig {
  return readRateLimitConfigFromEnv(
    "ADMIN_ACTION_RATE_LIMIT_MAX",
    "ADMIN_ACTION_RATE_WINDOW_SEC",
    DEFAULT_ADMIN_ACTION_RATE_LIMIT,
  );
}

export function isAdminServerActionRequest(request: Request): boolean {
  if (request.method !== "POST") return false;
  return (
    request.headers.has("next-action") || request.headers.has("Next-Action")
  );
}

export async function checkAdminActionRateLimit(params: {
  key: string;
  config?: AdminActionRateLimitConfig;
  kv?: {
    get(key: string): Promise<string | null>;
    put(
      key: string,
      value: string,
      options?: { expirationTtl?: number },
    ): Promise<void>;
  };
  now?: number;
}): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}> {
  return checkKvRateLimit({
    storageKey: `admin-action-rate:${params.key}`,
    config: params.config ?? readAdminActionRateLimitConfig(),
    kv: params.kv,
    now: params.now,
  });
}
