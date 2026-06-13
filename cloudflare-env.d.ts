/**
 * Types for Cloudflare bindings used at runtime.
 * OpenNext reads these types when using getCloudflareContext().
 */
type HyperdriveBinding = {
  connectionString: string;
};

/** Minimal R2 typing (Workers runtime). */
type R2HttpMetadata = { contentType?: string; cacheControl?: string };
type R2PutOptions = {
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
};
type R2ObjectBody = { arrayBuffer(): Promise<ArrayBuffer> };
type R2Object = {
  body: R2ObjectBody | null;
  httpMetadata?: R2HttpMetadata;
  customMetadata?: Record<string, string>;
  size: number;
};
type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | ReadableStream | Blob | null,
    options?: R2PutOptions,
  ): Promise<unknown>;
  get(key: string): Promise<R2Object | null>;
  head(key: string): Promise<R2Object | null>;
};

/** Workers KV — cache JSON công khai (FAQ, legal list, …). */
type KVNamespace = {
  get(key: string, type?: "text" | "json"): Promise<unknown>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

/** D1 — cờ edge / cấu hình nhẹ (banner, giảm tải tra cứu). */
type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
};
type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

interface CloudflareEnv {
  /** Postgres trực tiếp (wrangler secret) — ưu tiên hơn Hyperdrive với Prisma Postgres. */
  DATABASE_URL?: string;
  HYPERDRIVE: HyperdriveBinding;
  MEDIA_BUCKET?: R2Bucket;
  APP_CACHE?: KVNamespace;
  APP_CONFIG_D1?: D1Database;
  /** Bearer token tuỳ chọn — automation/CI; UI admin dùng session CMS. */
  MEDIA_INGEST_TOKEN?: string;
  /** HMAC cookie CMS — bắt buộc production (`wrangler secret put SESSION_SECRET`). */
  SESSION_SECRET?: string;
  /** POST /api/admin/revalidate-cache — xóa KV cache công khai. */
  CACHE_REVALIDATE_SECRET?: string;
  /** Base URL worker — cron gọi /api/cron/daily-official-crawl (tuỳ chọn). */
  CRON_WORKER_BASE_URL?: string;
  /** Giới hạn server action CMS trong một cửa sổ (mặc định 60). */
  ADMIN_ACTION_RATE_LIMIT_MAX?: string;
  /** Cửa sổ rate limit CMS tính bằng giây (mặc định 600). */
  ADMIN_ACTION_RATE_WINDOW_SEC?: string;
  /** Rate limit đăng nhập CMS (mặc định 10 / 900s). */
  LOGIN_RATE_LIMIT_MAX?: string;
  LOGIN_RATE_LIMIT_WINDOW_SEC?: string;
  /** Rate limit API công khai search/ask (mặc định 30 / 60s). */
  PUBLIC_API_RATE_LIMIT_MAX?: string;
  PUBLIC_API_RATE_LIMIT_WINDOW_SEC?: string;
  /** Rate limit form Hỏi HR (mặc định 5 / 900s). */
  ASK_HR_RATE_LIMIT_MAX?: string;
  ASK_HR_RATE_LIMIT_WINDOW_SEC?: string;
  /** Cloudflare Turnstile secret — xác minh token server-side. */
  TURNSTILE_SECRET_KEY?: string;
  /** Unsplash — tìm ảnh (wrangler secret). */
  UNSPLASH_ACCESS_KEY?: string;
  /** OpenAI — tạo ảnh DALL·E 3 (wrangler secret). */
  OPENAI_API_KEY?: string;
  /** Cloudflare Email Service — REST fallback. */
  CLOUDFLARE_EMAIL_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  HR_CONTACT_EMAIL?: string;
  HR_EMAIL_FROM?: string;
  /** Cloudflare Email Service binding. */
  EMAIL?: {
    send(message: {
      to: string;
      from: string | { email: string; name?: string };
      subject: string;
      text?: string;
      html?: string;
      replyTo?: string;
    }): Promise<{ messageId: string }>;
  };
}

