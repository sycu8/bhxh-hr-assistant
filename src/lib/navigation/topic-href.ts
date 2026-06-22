const CATEGORY_SLUGS = new Set(["bhxh", "bhyt", "thai-san"]);

const CATEGORY_DEFAULT_QUERY: Record<string, string> = {
  bhxh: "BHXH bắt buộc",
  bhyt: "BHYT",
  "thai-san": "Thai sản",
};

/** Gợi ý tra cứu kèm category (API yêu cầu query tối thiểu 2 ký tự). */
export function topicHref(slug: string, title: string) {
  if (CATEGORY_SLUGS.has(slug)) {
    const q = CATEGORY_DEFAULT_QUERY[slug] ?? title;
    return `/search?category=${encodeURIComponent(slug)}&q=${encodeURIComponent(q)}`;
  }
  return `/search?q=${encodeURIComponent(title)}`;
}
