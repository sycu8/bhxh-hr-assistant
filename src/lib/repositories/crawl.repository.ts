import type { PrismaClient } from "@prisma/client";
import { DocumentSourceType, DocumentStatus } from "@prisma/client";
import type {
  CrawlItemDraft,
  CrawlItemWriteRepository,
  CrawlSourceForCrawler,
} from "@/lib/services/legal-crawler.service";
import type {
  CrawlReviewRepository,
  LegalUpdateDraft,
  ReviewableCrawlItem,
} from "@/lib/services/crawl-review.service";

export class CrawlItemRepository implements CrawlItemWriteRepository {
  constructor(private readonly db: PrismaClient) {}

  async listActiveSources(): Promise<CrawlSourceForCrawler[]> {
    const rows = await this.db.crawlSource.findMany({
      where: { active: true, trustLevel: { in: ["HIGH", "MEDIUM"] } },
      orderBy: [{ trustLevel: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        baseUrl: true,
        domain: true,
        active: true,
      },
    });
    return rows;
  }

  /** Nguồn chính thống chạy theo lịch cron hàng ngày. */
  async listScheduledOfficialSources(): Promise<CrawlSourceForCrawler[]> {
    const rows = await this.db.crawlSource.findMany({
      where: {
        active: true,
        OR: [{ sourceType: "OFFICIAL" }, { crawlFrequency: "DAILY" }],
      },
      orderBy: [{ trustLevel: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        baseUrl: true,
        domain: true,
        active: true,
      },
    });
    return rows;
  }

  async listActiveKeywords(): Promise<string[]> {
    const rows = await this.db.crawlKeyword.findMany({
      where: { active: true },
      orderBy: { keyword: "asc" },
      select: { keyword: true },
    });
    return rows.map((row) => row.keyword);
  }

  async findDuplicateByCanonicalUrl(canonicalUrl: string) {
    return this.db.crawlItem.findUnique({
      where: { canonicalUrl },
      select: { id: true },
    });
  }

  async findDuplicateByContentHash(contentHash: string) {
    return this.db.crawlItem.findFirst({
      where: { contentHash },
      select: { id: true },
    });
  }

  async createPendingItem(draft: CrawlItemDraft) {
    return this.db.crawlItem.create({
      data: {
        sourceId: draft.sourceId,
        title: draft.title,
        url: draft.url,
        canonicalUrl: draft.canonicalUrl,
        domain: draft.domain,
        contentText: draft.contentText,
        rawHtml: draft.rawHtml,
        summary: draft.summary,
        detectedTopics: draft.detectedTopics,
        detectedKeywords: draft.detectedKeywords,
        legalDocumentType: draft.legalDocumentType,
        documentNumber: draft.documentNumber,
        issuedDate: draft.issuedDate,
        effectiveDate: draft.effectiveDate,
        expiryDate: draft.expiryDate,
        status: draft.status,
        contentHash: draft.contentHash,
        crawledAt: draft.crawledAt,
      },
      select: { id: true },
    });
  }

  async markSourceCrawled(sourceId: string, at: Date) {
    await this.db.crawlSource.update({
      where: { id: sourceId },
      data: { lastCrawledAt: at },
    });
  }
}

export class CrawlReviewPrismaRepository implements CrawlReviewRepository {
  constructor(private readonly db: PrismaClient) {}

  async getItemForReview(id: string): Promise<ReviewableCrawlItem | null> {
    const item = await this.db.crawlItem.findUnique({
      where: { id },
      include: { source: { select: { name: true } } },
    });
    if (!item) return null;
    return {
      id: item.id,
      status: item.status,
      title: item.title,
      summary: item.summary,
      contentText: item.contentText,
      url: item.url,
      sourceName: item.source.name,
      legalDocumentType: item.legalDocumentType,
      documentNumber: item.documentNumber,
      issuedDate: item.issuedDate,
      effectiveDate: item.effectiveDate,
    };
  }

  async updateItemReviewStatus(
    id: string,
    input: Parameters<CrawlReviewRepository["updateItemReviewStatus"]>[1],
  ) {
    await this.db.crawlItem.update({
      where: { id },
      data: {
        status: input.newStatus,
        reviewNote: input.note,
        reviewedById: input.actorId,
        reviewedAt: input.reviewedAt,
        publishedAt: input.publishedAt,
      },
    });
  }

  async createLegalUpdate(draft: LegalUpdateDraft) {
    const slug = await this.makeUniqueSlug(draft.slug, draft.crawlItemId);
    return this.db.$transaction(async (tx) => {
      const legalUpdate = await tx.legalUpdate.create({
        data: {
          crawlItemId: draft.crawlItemId,
          title: draft.title,
          slug,
          summary: draft.summary,
          body: draft.body,
          sourceUrl: draft.sourceUrl,
          sourceName: draft.sourceName,
          legalDocumentType: draft.legalDocumentType,
          documentNumber: draft.documentNumber,
          issuedDate: draft.issuedDate,
          effectiveDate: draft.effectiveDate,
          publishedAt: draft.publishedAt,
          impactLevel: draft.impactLevel,
          affectedGroups: draft.affectedGroups,
          hrActionRequired: draft.hrActionRequired,
          hrActionSummary: draft.hrActionSummary,
          status: draft.status,
        },
        select: { id: true },
      });

      const document = await tx.document.create({
        data: {
          title: draft.title,
          sourceType: DocumentSourceType.CRAWL,
          status: DocumentStatus.APPROVED,
          effectiveDate: draft.effectiveDate,
          storagePath: draft.sourceUrl,
        },
        select: { id: true },
      });
      const chunk = await tx.documentChunk.create({
        data: {
          documentId: document.id,
          content: draft.body,
          chunkIndex: 0,
          metadata: {
            crawlItemId: draft.crawlItemId,
            legalUpdateId: legalUpdate.id,
            sourceUrl: draft.sourceUrl,
            sourceName: draft.sourceName,
            legalDocumentType: draft.legalDocumentType,
            documentNumber: draft.documentNumber,
          },
        },
        select: { id: true },
      });
      await tx.citation.create({
        data: {
          documentId: document.id,
          documentChunkId: chunk.id,
          title: draft.title,
          sourceUrl: draft.sourceUrl,
          legalArticle: draft.documentNumber,
          effectiveDate: draft.effectiveDate,
        },
      });

      return legalUpdate;
    });
  }

  async createAuditLog(
    input: Parameters<CrawlReviewRepository["createAuditLog"]>[0],
  ) {
    await this.db.reviewAuditLog.create({ data: input });
  }

  private async makeUniqueSlug(base: string, itemId: string): Promise<string> {
    const existing = await this.db.legalUpdate.findUnique({
      where: { slug: base },
      select: { id: true },
    });
    if (!existing) return base;
    return `${base}-${itemId.slice(0, 8)}`;
  }
}
