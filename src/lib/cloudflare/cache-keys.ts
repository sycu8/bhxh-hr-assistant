/** Khóa KV cache nội dung công khai đã duyệt (TTL ngắn, có thể xóa qua API). */
export const CACHE_KEYS = {
  faqList50: "cache:v1:faq:list:50",
  homePopular6: "cache:v1:home:popular:6",
  legalPublished50: "cache:v1:legal:published:50",
} as const;

export function allPublicCacheKeys(): string[] {
  return [CACHE_KEYS.faqList50, CACHE_KEYS.homePopular6, CACHE_KEYS.legalPublished50];
}
