import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { CURATED_LEGAL_UPDATES } from "@/lib/data/curated-legal-updates";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";

type SitemapEntryInput = {
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
  lastModified?: Date | string;
};

const STATIC_PUBLIC_PATHS: SitemapEntryInput[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/search", changeFrequency: "weekly", priority: 0.9 },
  { path: "/hoi-dap", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ask-hr", changeFrequency: "monthly", priority: 0.8 },
  { path: "/calculators", changeFrequency: "weekly", priority: 0.85 },
  { path: "/calculators/luong-co-ban", changeFrequency: "monthly", priority: 0.75 },
  { path: "/calculators/chinh-sach-mien-giam", changeFrequency: "monthly", priority: 0.75 },
  { path: "/calculators/che-do-thai-san", changeFrequency: "monthly", priority: 0.75 },
  { path: "/cong-cu-luong-thue", changeFrequency: "monthly", priority: 0.75 },
  { path: "/nguon-phap-luat", changeFrequency: "monthly", priority: 0.8 },
  { path: "/topics", changeFrequency: "monthly", priority: 0.75 },
  { path: "/legal-updates", changeFrequency: "weekly", priority: 0.85 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.7 },
];

function toEntry(input: SitemapEntryInput): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(input.path),
    lastModified: input.lastModified ?? new Date(),
    changeFrequency: input.changeFrequency ?? "monthly",
    priority: input.priority ?? 0.5,
  };
}

/** Tập URL công khai cho sitemap (testable). */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const entries: SitemapEntryInput[] = [...STATIC_PUBLIC_PATHS];

  for (const faq of listCuratedFaqs()) {
    entries.push({
      path: `/hoi-dap/${faq.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const topic of TOPICS) {
    entries.push({
      path: `/topics/${topic.slug}`,
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  const legalSlugs = new Set(CURATED_LEGAL_UPDATES.map((u) => u.slug));
  for (const slug of legalSlugs) {
    const row = CURATED_LEGAL_UPDATES.find((u) => u.slug === slug);
    entries.push({
      path: `/legal-updates/${slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: row?.publishedAt,
    });
  }

  return entries.map(toEntry);
}
