import { legalContentMutationCacheKeys } from "@/lib/cloudflare/cache-keys";
import { deletePublicKvCache } from "@/lib/cloudflare/kv-json-cache";

/** Xóa cache công khai + admin queue sau khi duyệt/từ chối văn bản crawl. */
export async function invalidateLegalContentCaches(
  slugs: string[] = [],
): Promise<void> {
  await deletePublicKvCache(legalContentMutationCacheKeys(slugs));
}
