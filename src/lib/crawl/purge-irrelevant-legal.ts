import type { PrismaClient } from "@prisma/client";
import { isInsuranceLegalDocumentRelevant } from "@/lib/crawl/bhxh-legal-relevance";

export const IRRELEVANT_LEGAL_NOTE =
  "Loại — văn bản không liên quan lao động/nhân sự hoặc BHXH/BHYT/BHTN.";

export type PurgeIrrelevantLegalResult = {
  scannedCrawlItems: number;
  archivedCrawlItems: number;
  scannedLegalUpdates: number;
  archivedLegalUpdates: number;
};

function isRelevant(input: {
  title: string;
  summary?: string | null;
  body?: string | null;
  documentNumber?: string | null;
}): boolean {
  return isInsuranceLegalDocumentRelevant({
    title: input.title,
    summary: input.summary ?? undefined,
    body: input.body ?? undefined,
    documentNumber: input.documentNumber,
  });
}

/** Lưu trữ văn bản thu thập không liên quan lao động/nhân sự hoặc bảo hiểm. */
export async function purgeIrrelevantCrawlItems(
  db: PrismaClient,
): Promise<{ scanned: number; archived: number }> {
  const rows = await db.crawlItem.findMany({
    where: { status: { in: ["NEW", "PENDING_REVIEW", "APPROVED"] } },
    select: {
      id: true,
      status: true,
      title: true,
      summary: true,
      contentText: true,
      documentNumber: true,
    },
  });

  const irrelevant = rows.filter(
    (row) =>
      !isRelevant({
        title: row.title,
        summary: row.summary,
        body: row.contentText,
        documentNumber: row.documentNumber,
      }),
  );

  if (irrelevant.length === 0) {
    return { scanned: rows.length, archived: 0 };
  }

  const now = new Date();
  const ids = irrelevant.map((row) => row.id);

  await db.$transaction([
    db.crawlItem.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "ARCHIVED",
        reviewNote: IRRELEVANT_LEGAL_NOTE,
        reviewedAt: now,
      },
    }),
    db.reviewAuditLog.createMany({
      data: irrelevant.map((row) => ({
        entityType: "CrawlItem",
        entityId: row.id,
        action: "AUTO_ARCHIVE_IRRELEVANT",
        oldStatus: row.status,
        newStatus: "ARCHIVED",
        note: IRRELEVANT_LEGAL_NOTE,
      })),
    }),
  ]);

  return { scanned: rows.length, archived: irrelevant.length };
}

/** Gỡ xuất bản các cập nhật pháp luật không liên quan lao động/nhân sự hoặc bảo hiểm. */
export async function purgeIrrelevantLegalUpdates(
  db: PrismaClient,
): Promise<{ scanned: number; archived: number }> {
  const rows = await db.legalUpdate.findMany({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    select: {
      id: true,
      status: true,
      title: true,
      summary: true,
      body: true,
      documentNumber: true,
    },
  });

  const irrelevant = rows.filter(
    (row) =>
      !isRelevant({
        title: row.title,
        summary: row.summary,
        body: row.body,
        documentNumber: row.documentNumber,
      }),
  );

  if (irrelevant.length === 0) {
    return { scanned: rows.length, archived: 0 };
  }

  const ids = irrelevant.map((row) => row.id);

  await db.$transaction([
    db.legalUpdate.updateMany({
      where: { id: { in: ids } },
      data: { status: "ARCHIVED" },
    }),
    db.reviewAuditLog.createMany({
      data: irrelevant.map((row) => ({
        entityType: "LegalUpdate",
        entityId: row.id,
        action: "AUTO_ARCHIVE_IRRELEVANT",
        oldStatus: row.status,
        newStatus: "ARCHIVED",
        note: IRRELEVANT_LEGAL_NOTE,
      })),
    }),
  ]);

  return { scanned: rows.length, archived: irrelevant.length };
}

export async function purgeIrrelevantLegalDocuments(
  db: PrismaClient,
): Promise<PurgeIrrelevantLegalResult> {
  const [crawl, legal] = await Promise.all([
    purgeIrrelevantCrawlItems(db),
    purgeIrrelevantLegalUpdates(db),
  ]);

  return {
    scannedCrawlItems: crawl.scanned,
    archivedCrawlItems: crawl.archived,
    scannedLegalUpdates: legal.scanned,
    archivedLegalUpdates: legal.archived,
  };
}
