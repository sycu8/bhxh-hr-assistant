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
      findDuplicateByCanonicalUrl: vi.fn().mockResolvedValue({ id: "old-1" }),
    });
    const adapter: CrawlProviderAdapter = {
      sourceKey: "generic",
      discoverUrls: vi.fn().mockResolvedValue([{ url: "https://vbpl.vn/doc?id=1&utm_source=x" }]),
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

  it("keeps every item from the authoritative BHXH legal document list even without keyword hits", async () => {
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
        title: "420/QĐ-BHXH",
        contentText: "Quyết định ban hành quy chế thực hiện dân chủ trong hoạt động của cơ quan.",
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
      title: "420/QĐ-BHXH",
      canonicalUrl:
        "https://baohiemxahoi.gov.vn/vanban/Pages/default.aspx?ItemID=1002",
      detectedKeywords: [],
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
  it("approves a crawl item by creating a published legal update and audit log", async () => {
    const repo: CrawlReviewRepository = {
      getItemForReview: vi.fn().mockResolvedValue({
        id: "item-1",
        status: "PENDING_REVIEW",
        title: "Quyết định hướng dẫn BHXH",
        summary: "Tóm tắt chính sách BHXH.",
        contentText: "Nội dung chi tiết đã được crawl.",
        url: "https://baohiemxahoi.gov.vn/qd",
        sourceName: "BHXH Việt Nam",
        legalDocumentType: "DECISION",
        documentNumber: "123/QĐ-BHXH",
        issuedDate: new Date("2026-05-01T00:00:00.000Z"),
        effectiveDate: new Date("2026-06-01T00:00:00.000Z"),
      }),
      updateItemReviewStatus: vi.fn().mockResolvedValue(undefined),
      createLegalUpdate: vi.fn().mockResolvedValue({ id: "lu-1" }),
      createAuditLog: vi.fn().mockResolvedValue(undefined),
    };

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
    expect(repo.updateItemReviewStatus).toHaveBeenCalledWith(
      "item-1",
      expect.objectContaining({
        newStatus: "APPROVED",
        actorId: "admin-1",
      }),
    );
    expect(repo.createLegalUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        crawlItemId: "item-1",
        title: "Quyết định hướng dẫn BHXH",
        slug: "quyet-dinh-huong-dan-bhxh",
        status: "PUBLISHED",
        sourceUrl: "https://baohiemxahoi.gov.vn/qd",
        impactLevel: "HIGH",
        affectedGroups: ["HR", "EMPLOYER"],
      }),
    );
    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "CrawlItem",
        entityId: "item-1",
        action: "APPROVE",
        oldStatus: "PENDING_REVIEW",
        newStatus: "APPROVED",
      }),
    );
  });
});
