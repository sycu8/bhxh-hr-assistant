import { ok, withApiHandler } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { allPublicCacheKeys } from "@/lib/cloudflare/cache-keys";
import { deletePublicKvCache } from "@/lib/cloudflare/kv-json-cache";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";

export const runtime = "nodejs";

/**
 * Xóa cache KV công khai (FAQ list, FAQ nổi bật, danh sách legal publish).
 * Authorization: Bearer <CACHE_REVALIDATE_SECRET> (Wrangler secret hoặc .env local).
 */
export const POST = withApiHandler(async (req: Request) => {
  const env = tryGetCloudflareEnv();
  const secret =
    env?.CACHE_REVALIDATE_SECRET ?? process.env.CACHE_REVALIDATE_SECRET;
  if (!secret) {
    throw ApiError.serviceUnavailable(
      "Chưa cấu hình CACHE_REVALIDATE_SECRET — không thể xóa cache từ API.",
    );
  }
  const auth = req.headers.get("authorization")?.trim();
  if (auth !== `Bearer ${secret}`) {
    throw ApiError.unauthorized("Token không hợp lệ.");
  }

  const keys = allPublicCacheKeys();
  const cleared = await deletePublicKvCache(keys);
  return ok({ purgedKeys: keys, kvCleared: cleared });
});
