import { cache } from "react";
import type { PopularFaqRow } from "@/lib/db/home-queries";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";

const topicTitleBySlug = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));

/** Curated fallback when Postgres is unavailable — no network I/O. */
export function getCuratedPopularFaqs(limit = 6): PopularFaqRow[] {
  return listCuratedFaqs()
    .slice(0, limit)
    .map((faq) => ({
      id: faq.slug,
      question: faq.question,
      shortAnswer: faq.answer,
      category: {
        slug: faq.categorySlug,
        name: topicTitleBySlug[faq.categorySlug] ?? faq.categorySlug,
      },
    }));
}

/** Memoized per request — avoids re-slicing curated list on same render. */
export const getCuratedPopularFaqsCached = cache((limit = 6) =>
  getCuratedPopularFaqs(limit),
);
