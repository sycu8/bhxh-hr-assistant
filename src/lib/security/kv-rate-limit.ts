export type RateLimitConfig = {
  max: number;
  windowSec: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

export type RateLimitKv = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

const defaultMemoryBuckets = new Map<string, RateLimitState>();

function readState(raw: string | null, now: number): RateLimitState {
  if (!raw) {
    return { count: 0, resetAt: now };
  }
  try {
    const parsed = JSON.parse(raw) as RateLimitState;
    if (
      typeof parsed.count === "number" &&
      typeof parsed.resetAt === "number" &&
      parsed.resetAt > now
    ) {
      return parsed;
    }
  } catch {
    // ignore corrupt KV payload
  }
  return { count: 0, resetAt: now };
}

export async function checkKvRateLimit(params: {
  storageKey: string;
  config: RateLimitConfig;
  kv?: RateLimitKv;
  memoryBuckets?: Map<string, RateLimitState>;
  now?: number;
}): Promise<{
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}> {
  const config = params.config;
  const now = params.now ?? Date.now();
  const windowMs = config.windowSec * 1000;
  const buckets = params.memoryBuckets ?? defaultMemoryBuckets;

  let state: RateLimitState;
  if (params.kv) {
    state = readState(await params.kv.get(params.storageKey), now);
  } else {
    state = buckets.get(params.storageKey) ?? { count: 0, resetAt: now };
  }

  if (state.resetAt <= now) {
    state = { count: 0, resetAt: now + windowMs };
  }

  if (state.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  const next: RateLimitState = {
    count: state.count + 1,
    resetAt: state.resetAt,
  };

  if (params.kv) {
    await params.kv.put(params.storageKey, JSON.stringify(next), {
      expirationTtl: config.windowSec + 30,
    });
  } else {
    buckets.set(params.storageKey, next);
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.max - next.count),
    retryAfterSec: 0,
  };
}

export function readRateLimitConfigFromEnv(
  maxKey: string,
  windowKey: string,
  defaults: RateLimitConfig,
): RateLimitConfig {
  const max = Number.parseInt(process.env[maxKey] ?? "", 10);
  const windowSec = Number.parseInt(process.env[windowKey] ?? "", 10);
  return {
    max: Number.isFinite(max) && max > 0 ? max : defaults.max,
    windowSec:
      Number.isFinite(windowSec) && windowSec >= 30
        ? windowSec
        : defaults.windowSec,
  };
}

export function rateLimit429Response(
  retryAfterSec: number,
  message: string,
): Response {
  return Response.json(
    { error: { message } },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}
