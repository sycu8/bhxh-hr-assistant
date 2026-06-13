import { describe, expect, it, vi } from "vitest";
import {
  BULK_CRAWL_REVIEW_MAX,
  CrawlReviewService,
  type CrawlReviewRepository,
} from "@/lib/services/crawl-review.service";

const pendingItem = {
  id: "item-a",
  status: "PENDING_REVIEW" as const,
  title: "Nghị định BHXH",
  summary: "Tóm tắt",
  contentText: "Nội dung",
  url: "https://example.com/a",
  sourceName: "BHXH",
  legalDocumentType: "DECREE" as const,
  documentNumber: "01/2026",
  issuedDate: null,
  effectiveDate: null,
};

function makeRepo(items: typeof pendingItem[]): CrawlReviewRepository {
  return {
    getItemForReview: vi.fn(),
    getItemsForReview: vi.fn().mockResolvedValue(items),
    updateItemReviewStatus: vi.fn().mockResolvedValue(undefined),
    bulkUpdateItemReviewStatus: vi.fn().mockResolvedValue(undefined),
    approveItemAtomically: vi
      .fn()
      .mockImplementation(async (item: typeof pendingItem) => ({
        id: `lu-${item.id}`,
        slug: `slug-${item.id}`,
      })),
    createLegalUpdate: vi.fn(),
    createAuditLog: vi.fn().mockResolvedValue(undefined),
    createAuditLogs: vi.fn().mockResolvedValue(undefined),
  };
}

describe("CrawlReviewService bulk", () => {
  it("bulk approves up to the configured max items", async () => {
    const items = Array.from({ length: 25 }, (_, index) => ({
      ...pendingItem,
      id: `item-${index}`,
      title: `Văn bản ${index}`,
    }));
    const repo = makeRepo(items);
    const service = new CrawlReviewService(repo);

    const ids = items.map((item) => item.id);
    const result = await service.bulkApprove(ids, { actorId: "admin-1" });

    expect(result.succeeded).toHaveLength(25);
    expect(result.failed).toHaveLength(0);
    expect(result.publishedSlugs).toHaveLength(25);
    expect(repo.approveItemAtomically).toHaveBeenCalledTimes(25);
  });

  it("caps bulk reject at BULK_CRAWL_REVIEW_MAX", async () => {
    const items = Array.from({ length: BULK_CRAWL_REVIEW_MAX }, (_, index) => ({
      ...pendingItem,
      id: `item-${index}`,
    }));
    const repo = makeRepo(items);
    const service = new CrawlReviewService(repo);

    const ids = Array.from({ length: 60 }, (_, index) => `item-${index}`);
    const result = await service.bulkReject(ids, { actorId: "admin-1" });

    expect(result.succeeded).toHaveLength(BULK_CRAWL_REVIEW_MAX);
    expect(repo.bulkUpdateItemReviewStatus).toHaveBeenCalledTimes(1);
    expect(repo.createAuditLogs).toHaveBeenCalledTimes(1);
  });
});
