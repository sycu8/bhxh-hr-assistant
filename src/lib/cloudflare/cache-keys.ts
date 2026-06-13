/** Khóa KV cache nội dung công khai đã duyệt (TTL ngắn, có thể xóa qua API). */
export const CACHE_KEYS = {
  faqList50: "cache:v1:faq:list:50",
  homePopular6: "cache:v1:home:popular:6",
  legalPublished50: "cache:v1:legal:published:50",
  adminCrawlerQueue: "cache:v1:admin:crawler:queue",
  legalDetailPrefix: "cache:v1:legal:detail:",
} as const;

export function legalDetailCacheKey(slug: string): string {
  return `${CACHE_KEYS.legalDetailPrefix}${slug}`;
}

export function allPublicCacheKeys(): string[] {
  return [CACHE_KEYS.faqList50, CACHE_KEYS.homePopular6, CACHE_KEYS.legalPublished50];
}

/** Keys invalidated when crawl items are approved/rejected. */
export function legalContentMutationCacheKeys(slugs: string[] = []): string[] {
  const keys = [...allPublicCacheKeys(), CACHE_KEYS.adminCrawlerQueue];
  for (const slug of slugs) {
    if (slug) keys.push(legalDetailCacheKey(slug));
  }
  return keys;
}
