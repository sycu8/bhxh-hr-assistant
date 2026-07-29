import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { buildSitemapEntries } from "@/lib/sitemap/entries";

/** Cache sitemap 24h — tránh regenerate mỗi request trên Workers. */
export const revalidate = 86400;

const FALLBACK: MetadataRoute.Sitemap = [
  {
    url: absoluteUrl("/"),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: absoluteUrl("/search"),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: absoluteUrl("/hoi-dap"),
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    return buildSitemapEntries();
  } catch (err) {
    console.error("[sitemap] buildSitemapEntries failed:", err);
    return FALLBACK;
  }
}
