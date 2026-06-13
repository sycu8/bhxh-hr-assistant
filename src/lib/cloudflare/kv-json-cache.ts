import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";

/** TTL mặc định cho danh sách FAQ / legal (giây). */
export const PUBLIC_CACHE_TTL_SEC = 90;

/** TTL cache hàng chờ admin — ngắn để duyệt hàng loạt vẫn thấy cập nhật nhanh. */
export const ADMIN_QUEUE_CACHE_TTL_SEC = 30;

/** TTL cache chi tiết văn bản pháp luật theo slug. */
export const LEGAL_DETAIL_CACHE_TTL_SEC = 300;

export async function withKvJsonCache<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const env = tryGetCloudflareEnv();
  const kv = env?.APP_CACHE as
    | {
        get(k: string, type: "json"): Promise<T | null>;
        put(
          k: string,
          v: string,
          opts?: { expirationTtl?: number },
        ): Promise<void>;
      }
    | undefined;

  if (!kv) {
    return load();
  }

  try {
    const cached = await kv.get(key, "json");
    if (cached != null) {
      return cached;
    }
    const fresh = await load();
    await kv.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
    return fresh;
  } catch {
    return load();
  }
}

export async function deletePublicKvCache(keys: string[]): Promise<boolean> {
  const env = tryGetCloudflareEnv();
  const kv = env?.APP_CACHE as { delete(k: string): Promise<void> } | undefined;
  if (!kv) return false;
  await Promise.all(keys.map((k) => kv.delete(k).catch(() => undefined)));
  return true;
}
