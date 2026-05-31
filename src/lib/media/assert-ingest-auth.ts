import { ApiError } from "@/lib/api/errors";
import type { MediaWorkerEnv } from "@/lib/media/media-bucket";

export function assertMediaIngestAuthorized(
  req: Request,
  env: MediaWorkerEnv,
): void {
  const expected = env.MEDIA_INGEST_TOKEN?.trim();
  if (!expected) {
    throw ApiError.serviceUnavailable(
      "Chưa cấu hình MEDIA_INGEST_TOKEN (wrangler secret). Ingest bị tắt để tránh lạm dụng bucket R2.",
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  const token = m?.[1]?.trim();
  if (!token || token !== expected) {
    throw ApiError.forbidden("Thiếu hoặc sai Bearer token cho ingest media.");
  }
}
