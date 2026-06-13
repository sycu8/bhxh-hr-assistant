const CATEGORY_SLUGS = new Set(["bhxh", "bhyt"]);

const TOPIC_REFERENCE_PAGES: Record<string, string> = {
  "thai-san": "/calculators/che-do-thai-san",
};

const CATEGORY_DEFAULT_QUERY: Record<string, string> = {
  bhxh: "BHXH bắt buộc",
  bhyt: "BHYT",
  "thai-san": "Thai sản",
};

/** Gợi ý tra cứu kèm category (API yêu cầu query tối thiểu 2 ký tự). */
export function topicHref(slug: string, title: string) {
  const referencePage = TOPIC_REFERENCE_PAGES[slug];
  if (referencePage) return referencePage;

  if (CATEGORY_SLUGS.has(slug)) {
    const q = CATEGORY_DEFAULT_QUERY[slug] ?? title;
    return `/search?category=${encodeURIComponent(slug)}&q=${encodeURIComponent(q)}`;
  }
  return `/search?q=${encodeURIComponent(title)}`;
}
