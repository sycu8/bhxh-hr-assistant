import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "@/lib/sitemap/entries";
import { listCuratedFaqs } from "@/lib/data/curated-faqs";
import { TOPICS } from "@/lib/data/topics";
import { CURATED_LEGAL_UPDATES } from "@/lib/data/curated-legal-updates";
import { getSiteUrl } from "@/lib/site-url";

describe("sitemap entries", () => {
  it("includes static hubs and curated FAQ slugs", () => {
    const entries = buildSitemapEntries();
    const urls = entries.map((e) => e.url);

    expect(urls.some((u) => u.endsWith("/search"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/hoi-dap"))).toBe(true);
    expect(urls.filter((u) => u.includes("/hoi-dap/")).length).toBe(
      listCuratedFaqs().length,
    );
    expect(urls.filter((u) => u.includes("/topics/")).length).toBe(TOPICS.length);
    expect(urls.filter((u) => u.includes("/legal-updates/")).length).toBe(
      CURATED_LEGAL_UPDATES.length,
    );
  });

  it("uses absolute URLs with site base", () => {
    const base = getSiteUrl();
    for (const entry of buildSitemapEntries()) {
      expect(entry.url.startsWith(base)).toBe(true);
    }
  });

  it("does not list admin or api routes", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls.some((u) => u.includes("/api/"))).toBe(false);
  });
});
