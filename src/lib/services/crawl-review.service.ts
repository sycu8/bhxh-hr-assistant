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

export class CrawlReviewService {
  constructor(private readonly repo: CrawlReviewRepository) {}

  async approve(
    itemId: string,
    input: ApproveCrawlItemInput = {},
  ): Promise<{ legalUpdateId: string }> {
    const item = await this.repo.getItemForReview(itemId);
    if (!item) throw new Error("Không tìm thấy nội dung crawl cần duyệt.");
    if (item.status === "APPROVED") {
      throw new Error("Nội dung crawl này đã được duyệt.");
    }
    if (item.status === "ARCHIVED") {
      throw new Error("Không thể duyệt nội dung đã lưu trữ.");
    }

    const now = new Date();
    await this.repo.updateItemReviewStatus(item.id, {
      newStatus: "APPROVED",
      actorId: input.actorId ?? null,
      note: input.note ?? null,
      reviewedAt: now,
      publishedAt: now,
    });
    const legalUpdate = await this.repo.createLegalUpdate({
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
    });
    await this.repo.createAuditLog({
      entityType: "CrawlItem",
      entityId: item.id,
      action: "APPROVE",
      oldStatus: item.status,
      newStatus: "APPROVED",
      note: input.note ?? null,
      actorId: input.actorId ?? null,
    });

    return { legalUpdateId: legalUpdate.id };
  }

  async reject(itemId: string, input: RejectCrawlItemInput = {}) {
    await this.transition(itemId, "REJECTED", "REJECT", input);
  }

  async archive(itemId: string, input: RejectCrawlItemInput = {}) {
    await this.transition(itemId, "ARCHIVED", "ARCHIVE", input);
  }

  private async transition(
    itemId: string,
    newStatus: CrawlReviewStatus,
    action: string,
    input: RejectCrawlItemInput,
  ) {
    const item = await this.repo.getItemForReview(itemId);
    if (!item) throw new Error("Không tìm thấy nội dung crawl cần duyệt.");
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
