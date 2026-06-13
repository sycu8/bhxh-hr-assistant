export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** SESSION_SECRET bắt buộc trên production — không dùng chung với cron/cache. */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (isProductionRuntime()) {
    throw new Error(
      "SESSION_SECRET chưa được cấu hình. Chạy: wrangler secret put SESSION_SECRET",
    );
  }
  return "dev-session-secret-local-only";
}
