import { describe, expect, it, vi } from "vitest";
import {
  BhxhLegalDocumentListAdapter,
  OfficialSourceCrawlerService,
  type CrawlItemDraft,
  type CrawlItemWriteRepository,
  type CrawlProviderAdapter,
  type CrawlSourceForCrawler,
} from "@/lib/services/legal-crawler.service";
import {
  CrawlReviewService,
  type CrawlReviewRepository,
} from "@/lib/services/crawl-review.service";

const source: CrawlSourceForCrawler = {
  id: "src-1",
  name: "BHXH Việt Nam",
  baseUrl: "https://baohiemxahoi.gov.vn",
  domain: "baohiemxahoi.gov.vn",
  active: true,
};

function makeRepo(overrides: Partial<CrawlItemWriteRepository> = {}) {
  const created: CrawlItemDraft[] = [];
  const repo: CrawlItemWriteRepository = {
    findDuplicateByCanonicalUrl: vi.fn().mockResolvedValue(null),
    findExistingCanonicalUrls: vi.fn().mockResolvedValue(new Set<string>()),
    findDuplicateByContentHash: vi.fn().mockResolvedValue(null),
    createPendingItem: vi.fn().mockImplementation(async (draft: CrawlItemDraft) => {
      created.push(draft);
      return { id: `item-${created.length}`, ...draft };
    }),
    markSourceCrawled: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return { repo, created };
}

describe("OfficialSourceCrawlerService", () => {
  it("stores relevant official content as pending review with source metadata", async () => {
    const { repo, created } = makeRepo();
    const adapter: CrawlProviderAdapter = {
      sourceKey: "generic",
      discoverUrls: vi.fn().mockResolvedValue([
        { url: "https://baohiemxahoi.gov.vn/tin/bhxh.html", title: "Tin BHXH" },
      ]),
      fetchAndExtract: vi.fn().mockResolvedValue({
        url: "https://baohiemxahoi.gov.vn/tin/bhxh.html",
        title: "Hướng dẫn bảo hiểm xã hội mới",
        contentText:
          "Bảo hiểm xã hội Việt Nam hướng dẫn doanh nghiệp đóng BHXH, BHYT, BHTN.",
        rawHtml: "<html></html>",
        publishedAt: new Date("2026-05-01T00:00:00.000Z"),
      }),
    };

    const service = new OfficialSourceCrawlerService({
      adapter,
      itemRepo: repo,
      keywords: ["bảo hiểm xã hội", "BHXH", "BHYT", "BHTN"],
    });

    const result = await service.crawlSource(source);

    expect(result.created).toBe(1);
    expect(created[0]).toMatchObject({
      sourceId: "src-1",
      title: "Hướng dẫn bảo hiểm xã hội mới",
      url: "https://baohiemxahoi.gov.vn/tin/bhxh.html",
      canonicalUrl: "https://baohiemxahoi.gov.vn/tin/bhxh.html",
      domain: "baohiemxahoi.gov.vn",
      status: "PENDING_REVIEW",
      detectedKeywords: ["bảo hiểm xã hội", "BHXH", "BHYT", "BHTN"],
    });
    expect(created[0].summary).toContain("Bảo hiểm xã hội Việt Nam");
    expect(created[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("skips content that does not match active insurance keywords", async () => {
    const { repo } = makeRepo();
    const adapter: CrawlProviderAdapter = {
      sourceKey: "generic",
      discoverUrls: vi.fn().mockResolvedValue([{ url: "https://chinhphu.vn/du-lich" }]),
      fetchAndExtract: vi.fn().mockResolvedValue({
        url: "https://chinhphu.vn/du-lich",
        title: "Tin du lịch",
        contentText: "Thông tin văn hóa du lịch không liên quan.",
      }),
    };

    const service = new OfficialSourceCrawlerService({
      adapter,
      itemRepo: repo,
      keywords: ["BHXH", "BHYT"],
    });

    const result = await service.crawlSource({
      ...source,
      baseUrl: "https://chinhphu.vn",
      domain: "chinhphu.vn",
    });

    expect(result.created).toBe(0);
    expect(result.skippedIrrelevant).toBe(1);
    expect(repo.createPendingItem).not.toHaveBeenCalled();
  });

  it("skips duplicate canonical URLs before fetching remote content", async () => {
    const { repo } = makeRepo({
      findExistingCanonicalUrls: vi
        .fn()
        .mockImplementation(async (urls: string[]) => new Set(urls)),
    });
    const adapter: CrawlProviderAdapter = {
      sourceKey: "generic",
      discoverUrls: vi.fn().mockResolvedValue([
        { url: "https://vbpl.vn/doc?id=1&utm_source=x" },
      ]),
      fetchAndExtract: vi.fn(),
    };

    const service = new OfficialSourceCrawlerService({
      adapter,
      itemRepo: repo,
      keywords: ["BHXH"],
    });

    const result = await service.crawlSource(source);

    expect(result.duplicates).toBe(1);
    expect(adapter.fetchAndExtract).not.toHaveBeenCalled();
  });

  it("skips BHXH list items that are not insurance-related even without keyword hits", async () => {
    const { repo, created } = makeRepo();
    const adapter: CrawlProviderAdapter = {
      sourceKey: "bhxh-legal-document-list",
      discoverUrls: vi.fn().mockResolvedValue([
        {
          url: "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1002",
          title: "420/QĐ-BHXH",
        },
      ]),
      fetchAndExtract: vi.fn().mockResolvedValue({
        url: "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1002",
        title: "Kết quả đấu thầu thuốc generic năm 2024",
        contentText:
          "Trích yếu: Kết quả đấu thầu thuốc generic Loại văn bản: Thông báo",
      }),
    };

    const service = new OfficialSourceCrawlerService({
      adapter,
      itemRepo: repo,
      keywords: ["thai sản"],
    });

    const result = await service.crawlSource(source);

    expect(result.created).toBe(0);
    expect(result.skippedIrrelevant).toBe(1);
    expect(created).toHaveLength(0);
  });

  it("keeps BHXH list items about insurance policy", async () => {
    const { repo, created } = makeRepo();
    const adapter: CrawlProviderAdapter = {
      sourceKey: "bhxh-legal-document-list",
      discoverUrls: vi.fn().mockResolvedValue([
        {
          url: "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1003",
          title: "366/QĐ-BHXH",
        },
      ]),
      fetchAndExtract: vi.fn().mockResolvedValue({
        url: "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1003",
        title: "366/QĐ-BHXH",
        contentText:
          "Trích yếu: Ban hành Quy trình thu bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp Loại văn bản: Quyết định",
      }),
    };

    const service = new OfficialSourceCrawlerService({
      adapter,
      itemRepo: repo,
      keywords: ["thai sản"],
    });

    const result = await service.crawlSource(source);

    expect(result.created).toBe(1);
    expect(created[0]).toMatchObject({
      title: "366/QĐ-BHXH",
      canonicalUrl:
        "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1003",
    });
  });
});

describe("BhxhLegalDocumentListAdapter", () => {
  it("discovers every ItemID document URL across BHXH list pages", async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);
      const html = href.includes("Page=2")
        ? `
          <html><body>
            <a href="/vanban/Pages/default.aspx?ItemID=1003">366/QĐ-BHXH</a>
            <a href="/vanban/Pages/default.aspx?ItemID=1004">1111/KH-BHXH</a>
          </body></html>
        `
        : `
          <html><body>
            <h2>DANH SÁCH VĂN BẢN (4)</h2>
            <a href="/vanban/Pages/default.aspx?ItemID=1001">422/QĐ-BHXH</a>
            <a href="/vanban/Pages/default.aspx?ItemID=1002">420/QĐ-BHXH</a>
            <a href="/vanban/Pages/default.aspx?Page=2">Cuối</a>
          </body></html>
        `;
      return new Response(html, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new BhxhLegalDocumentListAdapter();
    const urls = await adapter.discoverUrls(
      {
        ...source,
        baseUrl: "https://baohiemxahoi.gov.vn/vanban/pages/default.aspx",
      },
      [],
    );

    expect(urls.map((item) => item.url)).toEqual([
      "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1001",
      "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1002",
      "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1003",
      "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1004",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
});

describe("CrawlReviewService", () => {
  const reviewItem = {
    id: "item-1",
    status: "PENDING_REVIEW" as const,
    title: "Quyết định hướng dẫn BHXH",
    summary: "Tóm tắt chính sách BHXH.",
    contentText: "Nội dung chi tiết đã được crawl.",
    url: "https://baohiemxahoi.gov.vn/qd",
    sourceName: "BHXH Việt Nam",
    legalDocumentType: "DECISION" as const,
    documentNumber: "123/QĐ-BHXH",
    issuedDate: new Date("2026-05-01T00:00:00.000Z"),
    effectiveDate: new Date("2026-06-01T00:00:00.000Z"),
  };

  function makeReviewRepo(
    overrides: Partial<CrawlReviewRepository> = {},
  ): CrawlReviewRepository {
    return {
      getItemForReview: vi.fn().mockResolvedValue(reviewItem),
      getItemsForReview: vi.fn().mockResolvedValue([reviewItem]),
      updateItemReviewStatus: vi.fn().mockResolvedValue(undefined),
      bulkUpdateItemReviewStatus: vi.fn().mockResolvedValue(undefined),
      approveItemAtomically: vi.fn().mockResolvedValue({
        id: "lu-1",
        slug: "quyet-dinh-huong-dan-bhxh",
      }),
      createLegalUpdate: vi.fn().mockResolvedValue({ id: "lu-1" }),
      createAuditLog: vi.fn().mockResolvedValue(undefined),
      createAuditLogs: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it("approves a crawl item atomically with audit log", async () => {
    const repo = makeReviewRepo();

    const service = new CrawlReviewService(repo);
    const result = await service.approve("item-1", {
      actorId: "admin-1",
      note: "Đã kiểm tra nguồn",
      impactLevel: "HIGH",
      affectedGroups: ["HR", "EMPLOYER"],
      hrActionRequired: true,
      hrActionSummary: "Cập nhật checklist đóng BHXH.",
    });

    expect(result.legalUpdateId).toBe("lu-1");
    expect(result.slug).toBe("quyet-dinh-huong-dan-bhxh");
    expect(repo.approveItemAtomically).toHaveBeenCalledWith(
      reviewItem,
      expect.objectContaining({
        crawlItemId: "item-1",
        title: "Quyết định hướng dẫn BHXH",
        slug: "quyet-dinh-huong-dan-bhxh",
        status: "PUBLISHED",
        sourceUrl: "https://baohiemxahoi.gov.vn/qd",
        impactLevel: "HIGH",
        affectedGroups: ["HR", "EMPLOYER"],
      }),
      expect.objectContaining({
        entityType: "CrawlItem",
        entityId: "item-1",
        action: "APPROVE",
        oldStatus: "PENDING_REVIEW",
        newStatus: "APPROVED",
      }),
    );
  });

  it("rejects a crawl item and writes audit log", async () => {
    const repo = makeReviewRepo({
      getItemForReview: vi.fn().mockResolvedValue({
        ...reviewItem,
        id: "item-2",
        title: "Tin không phù hợp",
        summary: null,
        contentText: "Nội dung không liên quan.",
        url: "https://example.com/a",
        legalDocumentType: null,
        documentNumber: null,
        issuedDate: null,
        effectiveDate: null,
      }),
    });

    const service = new CrawlReviewService(repo);
    await service.reject("item-2", { note: "Không liên quan BHXH" });

    expect(repo.updateItemReviewStatus).toHaveBeenCalledWith(
      "item-2",
      expect.objectContaining({ newStatus: "REJECTED" }),
    );
    expect(repo.createLegalUpdate).not.toHaveBeenCalled();
    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "REJECT",
        newStatus: "REJECTED",
      }),
    );
  });
});
