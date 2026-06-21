import { describe, expect, it } from "vitest";
import { buildFaqPageJsonLd, buildSiteJsonLd } from "@/lib/seo/structured-data";
import {
  auditHtmlPage,
  auditQueryBenchmark,
  auditRobotsTxt,
  auditSitemapXml,
  rankFindings,
  resolveQuerySlugForBenchmark,
} from "@/lib/seo/audit-checks";
import { PRIORITY_QUERIES } from "@/lib/seo/priority-queries";
import { getCuratedFaqBySlug } from "@/lib/data/curated-faqs";
import { buildSitemapEntries } from "@/lib/sitemap/entries";

describe("structured data", () => {
  it("builds FAQPage JSON-LD with citations", () => {
    const faq = getCuratedFaqBySlug("bat-buoc-tham-gia-bhxh")!;
    const blocks = buildFaqPageJsonLd({ faq, topicTitle: "BHXH" });
    const faqPage = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faqPage).toBeDefined();
    expect(JSON.stringify(faqPage)).toContain("FAQPage");
    expect(JSON.stringify(faqPage)).toContain("phải tham gia BHXH");
  });

  it("builds WebSite with SearchAction", () => {
    const blocks = buildSiteJsonLd();
    expect(blocks.some((b) => b["@type"] === "WebSite")).toBe(true);
    expect(JSON.stringify(blocks)).toContain("SearchAction");
  });
});

describe("priority query mapping", () => {
  for (const q of PRIORITY_QUERIES) {
    it(`maps "${q.id}" to ${q.expectedSlug}`, () => {
      const slug = resolveQuerySlugForBenchmark(q.query);
      expect(slug).toBe(q.expectedSlug);
    });
  }
});

describe("audit checks", () => {
  it("flags missing FAQPage JSON-LD", () => {
    const findings = auditHtmlPage({
      path: "/hoi-dap/bat-buoc-tham-gia-bhxh",
      html: "<html><title>T</title><h1>Q</h1><body>Trả lời ngắn x</body></html>",
      status: 200,
    });
    expect(findings.some((f) => f.id.includes("faq-jsonld"))).toBe(true);
  });

  it("passes FAQ page with JSON-LD and answer-first", () => {
    const faq = getCuratedFaqBySlug("bat-buoc-tham-gia-bhxh")!;
    const jsonLd = JSON.stringify(buildFaqPageJsonLd({ faq }));
    const html = `<html><title>${faq.question}</title><h1>${faq.question}</h1><body>Trả lời ngắn ${faq.answer} Mở liên kết nguồn<script type="application/ld+json">${jsonLd}</script></body></html>`;
    const findings = auditHtmlPage({
      path: "/hoi-dap/bat-buoc-tham-gia-bhxh",
      html,
      status: 200,
    });
    expect(findings.filter((f) => f.severity === "critical")).toHaveLength(0);
  });

  it("validates robots and sitemap rules", () => {
    expect(auditRobotsTxt("User-agent: *\nDisallow: /admin\nSitemap: https://x/sitemap.xml")).toHaveLength(0);
    expect(
      auditSitemapXml("<urlset><loc>https://x/search</loc></urlset>", ["/search"]),
    ).toHaveLength(0);
  });

  it("ranks critical above medium", () => {
    const ranked = rankFindings([
      { id: "a", area: "titles", severity: "medium", message: "m" },
      { id: "b", area: "crawlability", severity: "critical", message: "c" },
    ]);
    expect(ranked[0].severity).toBe("critical");
  });
});

describe("sitemap indexation coverage", () => {
  it("includes more legal slugs than curated-only set", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    const legalCount = urls.filter((u) => u.includes("/legal-updates/")).length;
    expect(legalCount).toBeGreaterThan(4);
  });
});

describe("query benchmark simulation", () => {
  it("passes when HTML matches priority query", () => {
    const q = PRIORITY_QUERIES[0];
    const faq = getCuratedFaqBySlug(q.expectedSlug)!;
    const jsonLd = JSON.stringify(buildFaqPageJsonLd({ faq }));
    const html = `<html><body>${faq.answer}<script type="application/ld+json">${jsonLd}</script></body></html>`;
    const findings = auditQueryBenchmark({
      query: q,
      html,
      status: 200,
      resolvedSlug: q.expectedSlug,
    });
    expect(findings.filter((f) => f.severity === "critical")).toHaveLength(0);
  });
});
