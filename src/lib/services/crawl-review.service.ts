export type CrawlReviewStatus =
  | "NEW"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type ReviewableCrawlItem = {
  id: string;
  status: CrawlReviewStatus;
  title: string;
  summary: string | null;
  contentText: string;
  url: string;
  sourceName: string;
  legalDocumentType:
    | "LAW"
    | "DECREE"
    | "CIRCULAR"
    | "DECISION"
    | "OFFICIAL_DISPATCH"
    | "GUIDANCE"
    | "NEWS"
    | "OTHER"
    | null;
  documentNumber: string | null;
  issuedDate: Date | null;
  effectiveDate: Date | null;
};

export type LegalUpdateDraft = {
  crawlItemId: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  sourceUrl: string;
  sourceName: string;
  legalDocumentType: ReviewableCrawlItem["legalDocumentType"];
  documentNumber: string | null;
  issuedDate: Date | null;
  effectiveDate: Date | null;
  publishedAt: Date;
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  affectedGroups: string[];
  hrActionRequired: boolean;
  hrActionSummary: string | null;
  status: "PUBLISHED";
};

export interface CrawlReviewRepository {
  getItemForReview(id: string): Promise<ReviewableCrawlItem | null>;
  getItemsForReview(ids: string[]): Promise<ReviewableCrawlItem[]>;
  updateItemReviewStatus(
    id: string,
    input: {
      newStatus: CrawlReviewStatus;
      actorId?: string | null;
      note?: string | null;
      reviewedAt: Date;
      publishedAt?: Date | null;
    },
  ): Promise<void>;
  bulkUpdateItemReviewStatus(
    ids: string[],
    input: {
      newStatus: CrawlReviewStatus;
      actorId?: string | null;
      note?: string | null;
      reviewedAt: Date;
      publishedAt?: Date | null;
    },
  ): Promise<void>;
  approveItemAtomically(
    item: ReviewableCrawlItem,
    draft: LegalUpdateDraft,
    audit: {
      entityType: string;
      entityId: string;
      action: string;
      oldStatus?: string | null;
      newStatus?: string | null;
      note?: string | null;
      actorId?: string | null;
    },
  ): Promise<{ id: string; slug: string }>;
  createLegalUpdate(draft: LegalUpdateDraft): Promise<{ id: string }>;
  createAuditLog(input: {
    entityType: string;
    entityId: string;
    action: string;
    oldStatus?: string | null;
    newStatus?: string | null;
    note?: string | null;
    actorId?: string | null;
  }): Promise<void>;
  createAuditLogs(
    inputs: {
      entityType: string;
      entityId: string;
      action: string;
      oldStatus?: string | null;
      newStatus?: string | null;
      note?: string | null;
      actorId?: string | null;
    }[],
  ): Promise<void>;
}

export type ApproveCrawlItemInput = {
  actorId?: string | null;
  note?: string | null;
  impactLevel?: "LOW" | "MEDIUM" | "HIGH";
  affectedGroups?: string[];
  hrActionRequired?: boolean;
  hrActionSummary?: string | null;
};

export type RejectCrawlItemInput = {
  actorId?: string | null;
  note?: string | null;
};

export type BulkReviewResult = {
  succeeded: string[];
  failed: Array<{ id: string; reason: string }>;
  publishedSlugs: string[];
};

/** Tối đa mục duyệt/từ chối trong một thao tác bulk. */
export const BULK_CRAWL_REVIEW_MAX = 50;

export function slugifyLegalTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function assertReviewable(item: ReviewableCrawlItem, forApprove = false) {
  if (item.status === "APPROVED") {
    throw new Error("Nội dung crawl này đã được duyệt.");
  }
  if (item.status === "ARCHIVED") {
    throw new Error(
      forApprove
        ? "Không thể duyệt nội dung đã lưu trữ."
        : "Nội dung đã lưu trữ.",
    );
  }
}

export class CrawlReviewService {
  constructor(private readonly repo: CrawlReviewRepository) {}

  async approve(
    itemId: string,
    input: ApproveCrawlItemInput = {},
  ): Promise<{ legalUpdateId: string; slug: string }> {
    const item = await this.repo.getItemForReview(itemId);
    if (!item) throw new Error("Không tìm thấy nội dung crawl cần duyệt.");
    assertReviewable(item, true);

    const now = new Date();
    const draft = this.buildLegalUpdateDraft(item, input, now);
    const legalUpdate = await this.repo.approveItemAtomically(item, draft, {
      entityType: "CrawlItem",
      entityId: item.id,
      action: "APPROVE",
      oldStatus: item.status,
      newStatus: "APPROVED",
      note: input.note ?? null,
      actorId: input.actorId ?? null,
    });

    return { legalUpdateId: legalUpdate.id, slug: legalUpdate.slug };
  }

  async reject(itemId: string, input: RejectCrawlItemInput = {}) {
    await this.transition(itemId, "REJECTED", "REJECT", input);
  }

  async archive(itemId: string, input: RejectCrawlItemInput = {}) {
    await this.transition(itemId, "ARCHIVED", "ARCHIVE", input);
  }

  async bulkApprove(
    itemIds: string[],
    input: ApproveCrawlItemInput = {},
  ): Promise<BulkReviewResult> {
    const uniqueIds = [...new Set(itemIds)].slice(0, BULK_CRAWL_REVIEW_MAX);
    const items = await this.repo.getItemsForReview(uniqueIds);
    const byId = new Map(items.map((item) => [item.id, item]));
    const result: BulkReviewResult = {
      succeeded: [],
      failed: [],
      publishedSlugs: [],
    };

    for (const id of uniqueIds) {
      const item = byId.get(id);
      if (!item) {
        result.failed.push({ id, reason: "Không tìm thấy." });
        continue;
      }
      try {
        assertReviewable(item, true);
        const now = new Date();
        const draft = this.buildLegalUpdateDraft(item, input, now);
        const legalUpdate = await this.repo.approveItemAtomically(item, draft, {
          entityType: "CrawlItem",
          entityId: item.id,
          action: "BULK_APPROVE",
          oldStatus: item.status,
          newStatus: "APPROVED",
          note: input.note ?? null,
          actorId: input.actorId ?? null,
        });
        result.succeeded.push(id);
        result.publishedSlugs.push(legalUpdate.slug);
      } catch (err) {
        result.failed.push({
          id,
          reason: err instanceof Error ? err.message : "Lỗi không xác định.",
        });
      }
    }

    return result;
  }

  async bulkReject(
    itemIds: string[],
    input: RejectCrawlItemInput = {},
  ): Promise<BulkReviewResult> {
    return this.bulkTransition(itemIds, "REJECTED", "BULK_REJECT", input);
  }

  async bulkArchive(
    itemIds: string[],
    input: RejectCrawlItemInput = {},
  ): Promise<BulkReviewResult> {
    return this.bulkTransition(itemIds, "ARCHIVED", "BULK_ARCHIVE", input);
  }

  private buildLegalUpdateDraft(
    item: ReviewableCrawlItem,
    input: ApproveCrawlItemInput,
    now: Date,
  ): LegalUpdateDraft {
    return {
      crawlItemId: item.id,
      title: item.title,
      slug: slugifyLegalTitle(item.title) || item.id,
      summary: item.summary,
      body: item.contentText,
      sourceUrl: item.url,
      sourceName: item.sourceName,
      legalDocumentType: item.legalDocumentType,
      documentNumber: item.documentNumber,
      issuedDate: item.issuedDate,
      effectiveDate: item.effectiveDate,
      publishedAt: now,
      impactLevel: input.impactLevel ?? "MEDIUM",
      affectedGroups: input.affectedGroups ?? ["HR"],
      hrActionRequired: input.hrActionRequired ?? false,
      hrActionSummary: input.hrActionSummary ?? null,
      status: "PUBLISHED",
    };
  }

  private async bulkTransition(
    itemIds: string[],
    newStatus: CrawlReviewStatus,
    action: string,
    input: RejectCrawlItemInput,
  ): Promise<BulkReviewResult> {
    const uniqueIds = [...new Set(itemIds)].slice(0, BULK_CRAWL_REVIEW_MAX);
    const items = await this.repo.getItemsForReview(uniqueIds);
    const byId = new Map(items.map((item) => [item.id, item]));
    const result: BulkReviewResult = {
      succeeded: [],
      failed: [],
      publishedSlugs: [],
    };
    const eligible: ReviewableCrawlItem[] = [];

    for (const id of uniqueIds) {
      const item = byId.get(id);
      if (!item) {
        result.failed.push({ id, reason: "Không tìm thấy." });
        continue;
      }
      try {
        assertReviewable(item);
        eligible.push(item);
      } catch (err) {
        result.failed.push({
          id,
          reason: err instanceof Error ? err.message : "Lỗi không xác định.",
        });
      }
    }

    if (eligible.length === 0) return result;

    const now = new Date();
    await this.repo.bulkUpdateItemReviewStatus(
      eligible.map((item) => item.id),
      {
        newStatus,
        actorId: input.actorId ?? null,
        note: input.note ?? null,
        reviewedAt: now,
      },
    );
    await this.repo.createAuditLogs(
      eligible.map((item) => ({
        entityType: "CrawlItem",
        entityId: item.id,
        action,
        oldStatus: item.status,
        newStatus,
        note: input.note ?? null,
        actorId: input.actorId ?? null,
      })),
    );
    result.succeeded.push(...eligible.map((item) => item.id));
    return result;
  }

  private async transition(
    itemId: string,
    newStatus: CrawlReviewStatus,
    action: string,
    input: RejectCrawlItemInput,
  ) {
    const item = await this.repo.getItemForReview(itemId);
    if (!item) throw new Error("Không tìm thấy nội dung crawl cần duyệt.");
    assertReviewable(item);
    const now = new Date();
    await this.repo.updateItemReviewStatus(item.id, {
      newStatus,
      actorId: input.actorId ?? null,
      note: input.note ?? null,
      reviewedAt: now,
    });
    await this.repo.createAuditLog({
      entityType: "CrawlItem",
      entityId: item.id,
      action,
      oldStatus: item.status,
      newStatus,
      note: input.note ?? null,
      actorId: input.actorId ?? null,
    });
  }
}
