import { describe, expect, it } from "vitest";
import {
  summarizeBatchCrawlResult,
  summarizeCrawlResult,
} from "@/lib/crawl/crawl-action-messages";

describe("crawl action messages", () => {
  it("reports new items on success", () => {
    const result = summarizeCrawlResult(
      {
        discovered: 5,
        created: 2,
        duplicates: 1,
        skippedIrrelevant: 2,
        failed: 0,
      },
      "BHXH Việt Nam",
    );
    expect(result.variant).toBe("success");
    expect(result.message).toContain("2 mục mới");
  });

  it("reports empty crawl as success", () => {
    const result = summarizeCrawlResult(
      {
        discovered: 0,
        created: 0,
        duplicates: 0,
        skippedIrrelevant: 0,
        failed: 0,
      },
      "BHXH Việt Nam",
    );
    expect(result.variant).toBe("success");
    expect(result.message).toContain("không có nội dung mới");
  });

  it("summarizes batch crawl across sources", () => {
    const result = summarizeBatchCrawlResult(
      {
        discovered: 10,
        created: 3,
        duplicates: 0,
        skippedIrrelevant: 7,
        failed: 0,
      },
      4,
    );
    expect(result.message).toContain("Đã quét 4 nguồn");
    expect(result.message).toContain("3 mục mới");
  });
});
