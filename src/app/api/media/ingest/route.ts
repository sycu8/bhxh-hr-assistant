import { created, ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { assertMediaIngestAuthorized } from "@/lib/media/assert-ingest-auth";
import { getMediaWorkerEnv, getOptionalMediaBucket } from "@/lib/media/media-bucket";
import { MediaIngestService } from "@/lib/services/media-ingest.service";
import { mediaIngestBodySchema } from "@/lib/validators/media-ingest.schema";
import { ApiError } from "@/lib/api/errors";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const bucket = getOptionalMediaBucket();
  if (!bucket) {
    throw ApiError.serviceUnavailable(
      "R2 binding MEDIA_BUCKET không có (cần triển khai trên Cloudflare Worker và wrangler r2_buckets).",
    );
  }

  const env = getMediaWorkerEnv();
  assertMediaIngestAuthorized(req, env);

  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  const body = mediaIngestBodySchema.parse(raw);

  const svc = new MediaIngestService(bucket, {
    unsplashAccessKey: env.UNSPLASH_ACCESS_KEY,
    openaiApiKey: env.OPENAI_API_KEY,
  });

  const assets = await svc.ingest(body);
  return created({ assets });
});

/** Cho phép kiểm tra nhanh cấu hình (không ghi R2). */
export const GET = withApiHandler(async (req: Request) => {
  const env = getMediaWorkerEnv();
  assertMediaIngestAuthorized(req, env);
  const bucket = getOptionalMediaBucket();
  return ok({
    r2: Boolean(bucket),
    hasUnsplash: Boolean(env.UNSPLASH_ACCESS_KEY?.trim()),
    hasOpenAi: Boolean(env.OPENAI_API_KEY?.trim()),
    hasIngestToken: Boolean(env.MEDIA_INGEST_TOKEN?.trim()),
  });
});
