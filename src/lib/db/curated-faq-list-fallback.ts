import type { FaqListPublicRow } from "@/lib/db/faq-public-queries";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";

const topicTitleBySlug = Object.fromEntries(TOPICS.map((t) => [t.slug, t.title]));

/** Static FAQ list for /faq when DB is not configured. */
export function getCuratedFaqListPublicRows(limit = 50): FaqListPublicRow[] {
  return listCuratedFaqs()
    .slice(0, limit)
    .map((faq) => ({
      id: faq.slug,
      question: faq.question,
      shortAnswer: faq.answer,
      category_slug: faq.categorySlug,
      category_name: topicTitleBySlug[faq.categorySlug] ?? faq.categorySlug,
      citations_count: faq.citations.length,
    }));
}
