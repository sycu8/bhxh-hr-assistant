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
  HYPERDRIVE: HyperdriveBinding;
  MEDIA_BUCKET?: R2Bucket;
  APP_CACHE?: KVNamespace;
  APP_CONFIG_D1?: D1Database;
  /** Bearer token bắt buộc cho POST /api/media/ingest (wrangler secret). */
  MEDIA_INGEST_TOKEN?: string;
  /** POST /api/admin/revalidate-cache — xóa KV cache công khai. */
  CACHE_REVALIDATE_SECRET?: string;
  /** Base URL worker — cron gọi /api/cron/daily-official-crawl (tuỳ chọn). */
  CRON_WORKER_BASE_URL?: string;
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

