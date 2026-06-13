import type { PrismaClient } from "@prisma/client";
import {
  EXPIRED_PENDING_CRAWL_NOTE,
  isExpiredPendingCrawlItem,
} from "@/lib/crawl/pending-queue-hygiene";
import {
  findSupersededPendingIds,
  isIssuedFrom2025,
  SUPERSEDED_PENDING_NOTE,
  type CrawlDocReference,
} from "@/lib/crawl/superseded-pending";

export type PurgeExpiredPendingResult = {
  scanned: number;
  archived: number;
};

const ALL_PENDING_NOTE = "Loại khỏi hàng chờ — văn bản đã hết hạn.";

async function archivePendingItems(
  db: PrismaClient,
  items: Array<{ id: string; status: string }>,
  note: string,
  action: string,
): Promise<number> {
  if (items.length === 0) return 0;

  const now = new Date();
  const ids = items.map((item) => item.id);

  await db.$transaction([
    db.crawlItem.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "ARCHIVED",
        reviewNote: note,
        reviewedAt: now,
      },
    }),
    db.reviewAuditLog.createMany({
      data: items.map((item) => ({
        entityType: "CrawlItem",
        entityId: item.id,
        action,
        oldStatus: item.status,
        newStatus: "ARCHIVED",
        note,
      })),
    }),
  ]);

  return items.length;
}

function jsonTopics(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function toDocReference(row: {
  id: string;
  title: string;
  summary?: string | null;
  documentNumber?: string | null;
  legalDocumentType?: string | null;
  issuedDate?: Date | null;
  effectiveDate?: Date | null;
  detectedTopics?: unknown;
}): CrawlDocReference {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? null,
    documentNumber: row.documentNumber ?? null,
    legalDocumentType: row.legalDocumentType ?? null,
    issuedDate: row.issuedDate ?? null,
    effectiveDate: row.effectiveDate ?? null,
    detectedTopics: jsonTopics(row.detectedTopics),
  };
}

async function loadReplacementCorpus(db: PrismaClient): Promise<CrawlDocReference[]> {
  const replacementFrom = new Date("2025-01-01T00:00:00.000Z");
  const [crawlRows, legalRows] = await Promise.all([
    db.crawlItem.findMany({
      where: {
        status: { in: ["NEW", "PENDING_REVIEW", "APPROVED"] },
        OR: [
          { issuedDate: { gte: replacementFrom } },
          { effectiveDate: { gte: replacementFrom } },
        ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        documentNumber: true,
        legalDocumentType: true,
        issuedDate: true,
        effectiveDate: true,
        detectedTopics: true,
      },
      take: 200,
      orderBy: [{ issuedDate: "desc" }, { effectiveDate: "desc" }],
    }),
    db.legalUpdate.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { issuedDate: { gte: replacementFrom } },
          { effectiveDate: { gte: replacementFrom } },
          { publishedAt: { gte: replacementFrom } },
        ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        documentNumber: true,
        legalDocumentType: true,
        issuedDate: true,
        effectiveDate: true,
        publishedAt: true,
      },
      take: 100,
      orderBy: [{ publishedAt: "desc" }],
    }),
  ]);

  const crawlCorpus = crawlRows
    .map(toDocReference)
    .filter((row) => isIssuedFrom2025(row));

  return [
    ...crawlCorpus,
    ...legalRows.map((row) =>
      toDocReference({
        id: `legal-update-${row.id}`,
        title: row.title,
        summary: row.summary,
        documentNumber: row.documentNumber,
        legalDocumentType: row.legalDocumentType,
        issuedDate: row.issuedDate ?? row.publishedAt,
        effectiveDate: row.effectiveDate,
        detectedTopics: [],
      }),
    ),
  ];
}

/** Lưu trữ văn bản trước 2023 đã có bản thay thế từ 2025 trở đi. */
export async function purgeSupersededPendingCrawlItems(
  db: PrismaClient,
): Promise<PurgeExpiredPendingResult> {
  const pendingRows = await db.crawlItem.findMany({
    where: { status: { in: ["NEW", "PENDING_REVIEW"] } },
    select: {
      id: true,
      status: true,
      title: true,
      summary: true,
      documentNumber: true,
      legalDocumentType: true,
      issuedDate: true,
      effectiveDate: true,
      detectedTopics: true,
    },
  });

  const pending = pendingRows.map(toDocReference);
  const corpus = await loadReplacementCorpus(db);
  const supersededIds = new Set(findSupersededPendingIds(pending, corpus));
  const toArchive = pendingRows.filter((item) => supersededIds.has(item.id));

  const archived = await archivePendingItems(
    db,
    toArchive,
    SUPERSEDED_PENDING_NOTE,
    "AUTO_ARCHIVE_SUPERSEDED",
  );

  return { scanned: pendingRows.length, archived };
}

/** Dọn hàng chờ: hết hạn thời gian + văn bản bị thay thế. */
export async function purgePendingCrawlQueue(
  db: PrismaClient,
): Promise<PurgeExpiredPendingResult> {
  const superseded = await purgeSupersededPendingCrawlItems(db);
  const expired = await purgeExpiredPendingCrawlItems(db);
  return {
    scanned: Math.max(superseded.scanned, expired.scanned),
    archived: superseded.archived + expired.archived,
  };
}

/** Lưu trữ mục hết hạn hoặc quá hạn duyệt. */
export async function purgeExpiredPendingCrawlItems(
  db: PrismaClient,
): Promise<PurgeExpiredPendingResult> {
  const pending = await db.crawlItem.findMany({
    where: { status: { in: ["NEW", "PENDING_REVIEW"] } },
    select: {
      id: true,
      status: true,
      expiryDate: true,
      issuedDate: true,
      effectiveDate: true,
      crawledAt: true,
    },
  });

  const expired = pending.filter((item) => isExpiredPendingCrawlItem(item));
  const archived = await archivePendingItems(
    db,
    expired,
    EXPIRED_PENDING_CRAWL_NOTE,
    "AUTO_ARCHIVE_EXPIRED",
  );

  return { scanned: pending.length, archived };
}

/** Lưu trữ toàn bộ hàng chờ duyệt (dùng khi HR xác nhận backlog đã hết hạn). */
export async function archiveAllPendingCrawlItems(
  db: PrismaClient,
): Promise<PurgeExpiredPendingResult> {
  const pending = await db.crawlItem.findMany({
    where: { status: { in: ["NEW", "PENDING_REVIEW"] } },
    select: { id: true, status: true },
  });

  const archived = await archivePendingItems(
    db,
    pending,
    ALL_PENDING_NOTE,
    "AUTO_ARCHIVE_ALL_PENDING",
  );

  return { scanned: pending.length, archived };
}
