import { describe, expect, it } from "vitest";
import type { CrawlSourceForCrawler } from "@/lib/services/legal-crawler.service";

describe("scheduled official crawl selection", () => {
  it("includes OFFICIAL sources and DAILY frequency sources", () => {
    const sources: Array<
      CrawlSourceForCrawler & { sourceType?: string; crawlFrequency?: string }
    > = [
      {
        id: "1",
        name: "BHXH",
        baseUrl: "https://baohiemxahoi.gov.vn",
        domain: "baohiemxahoi.gov.vn",
        active: true,
        sourceType: "OFFICIAL",
        crawlFrequency: "DAILY",
      },
      {
        id: "2",
        name: "Chính phủ",
        baseUrl: "https://chinhphu.vn",
        domain: "chinhphu.vn",
        active: true,
        sourceType: "GOVERNMENT",
        crawlFrequency: "WEEKLY",
      },
      {
        id: "3",
        name: "Tin tức",
        baseUrl: "https://example.com",
        domain: "example.com",
        active: true,
        sourceType: "NEWS",
        crawlFrequency: "DAILY",
      },
    ];

    const selected = sources.filter(
      (source) =>
        source.active &&
        (source.sourceType === "OFFICIAL" || source.crawlFrequency === "DAILY"),
    );

    expect(selected.map((s) => s.id)).toEqual(["1", "3"]);
  });
});
