"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/db/prisma";
import {
  createCrawlerService,
} from "@/lib/crawl/crawl-runtime";
import {
  summarizeBatchCrawlResult,
  summarizeCrawlResult,
} from "@/lib/crawl/crawl-action-messages";
import type { ActionFeedback } from "@/lib/admin/action-feedback";
import { invalidateLegalContentCaches } from "@/lib/cloudflare/legal-content-cache";
import { assertSafeOutboundUrl } from "@/lib/security/ssrf";
import {
  archiveAllPendingCrawlItems,
  purgePendingCrawlQueue,
  purgeSupersededPendingCrawlItems,
} from "@/lib/crawl/purge-expired-pending";
import {
  CrawlItemRepository,
  CrawlReviewPrismaRepository,
} from "@/lib/repositories/crawl.repository";
import type { CrawlSourceForCrawler } from "@/lib/services/legal-crawler.service";
import {
  BULK_CRAWL_REVIEW_MAX,
  CrawlReviewService,
} from "@/lib/services/crawl-review.service";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function itemIdsFromForm(formData: FormData): string[] {
  return formData
    .getAll("itemIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .slice(0, BULK_CRAWL_REVIEW_MAX);
}

async function requireLegalWrite() {
  return requirePermission("legal:write");
}

async function afterCrawlReviewMutation(publishedSlugs: string[] = []) {
  await invalidateLegalContentCaches(publishedSlugs);
  revalidatePath("/admin/legal-crawler");
  revalidatePath("/cap-nhat-phap-luat");
  revalidatePath("/legal-updates");
}

function parseApproveInput(formData: FormData, actorId: string) {
  const affectedGroups = formData
    .getAll("affectedGroups")
    .filter((v): v is string => typeof v === "string");
  return {
    actorId,
    note: textValue(formData, "note") || null,
    impactLevel: (textValue(formData, "impactLevel") || "MEDIUM") as
      | "LOW"
      | "MEDIUM"
      | "HIGH",
    affectedGroups: affectedGroups.length > 0 ? affectedGroups : ["HR"],
    hrActionRequired: formData.get("hrActionRequired") === "on",
    hrActionSummary: textValue(formData, "hrActionSummary") || null,
  };
}

export async function runCrawlForSourceAction(
  formData: FormData,
): Promise<ActionFeedback> {
  await requireLegalWrite();
  const sourceId = textValue(formData, "sourceId");
  if (!sourceId) throw new Error("Không xác định được nguồn cần thu thập.");
  const db = getDb();
  const source = await db.crawlSource.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      domain: true,
      active: true,
    },
  });
  if (!source) throw new Error("Không tìm thấy nguồn thu thập.");
  const { service } = await createCrawlerService(source);
  const result = await service.crawlSource(source);
  revalidatePath("/admin/legal-crawler");
  await invalidateLegalContentCaches();
  return summarizeCrawlResult(result, source.name);
}

export async function runCrawlAllSourcesAction(
  _formData: FormData,
): Promise<ActionFeedback> {
  await requireLegalWrite();
  const repo = new CrawlItemRepository(getDb());
  const sources = await repo.listActiveSources();
  if (sources.length === 0) {
    return {
      message: "Không có nguồn nào đang bật để thu thập.",
      variant: "error",
    };
  }
  const totals = {
    discovered: 0,
    created: 0,
    duplicates: 0,
    skippedIrrelevant: 0,
    failed: 0,
  };
  for (const source of sources) {
    try {
      const { service } = await createCrawlerService(source);
      const result = await service.crawlSource(source);
      totals.discovered += result.discovered;
      totals.created += result.created;
      totals.duplicates += result.duplicates;
      totals.skippedIrrelevant += result.skippedIrrelevant;
      totals.failed += result.failed;
    } catch {
      totals.failed += 1;
    }
  }
  revalidatePath("/admin/legal-crawler");
  await invalidateLegalContentCaches();
  return summarizeBatchCrawlResult(totals, sources.length);
}

export async function crawlManualUrlAction(
  formData: FormData,
): Promise<ActionFeedback> {
  await requireLegalWrite();
  const sourceId = textValue(formData, "sourceId");
  const url = textValue(formData, "url");
  if (!sourceId || !url) {
    throw new Error("Vui lòng chọn nguồn và nhập URL hợp lệ.");
  }
  const db = getDb();
  const source = await db.crawlSource.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      domain: true,
      active: true,
    },
  });
  if (!source) throw new Error("Không tìm thấy nguồn thu thập.");
  assertSafeOutboundUrl(url, { allowedHostSuffix: source.domain });
  const { service } = await createCrawlerService(source);
  const result = await service.crawlManualUrl(
    source satisfies CrawlSourceForCrawler,
    url,
  );
  revalidatePath("/admin/legal-crawler");
  return summarizeCrawlResult(result, "URL thủ công");
}

export async function approveCrawlItemAction(formData: FormData) {
  const user = await requireLegalWrite();
  const itemId = textValue(formData, "itemId");
  if (!itemId) return;
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  const result = await service.approve(itemId, parseApproveInput(formData, user.id));
  await afterCrawlReviewMutation([result.slug]);
}

export async function rejectCrawlItemAction(formData: FormData) {
  const user = await requireLegalWrite();
  const itemId = textValue(formData, "itemId");
  if (!itemId) throw new Error("Không xác định được mục cần từ chối.");
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  await service.reject(itemId, {
    actorId: user.id,
    note: textValue(formData, "note") || null,
  });
  await afterCrawlReviewMutation();
}

export async function archiveCrawlItemAction(formData: FormData) {
  const user = await requireLegalWrite();
  const itemId = textValue(formData, "itemId");
  if (!itemId) throw new Error("Không xác định được mục cần lưu trữ.");
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  await service.archive(itemId, {
    actorId: user.id,
    note: textValue(formData, "note") || null,
  });
  await afterCrawlReviewMutation();
}

export async function bulkReviewCrawlItemsAction(
  formData: FormData,
): Promise<ActionFeedback> {
  const user = await requireLegalWrite();
  const itemIds = itemIdsFromForm(formData);
  const bulkAction = textValue(formData, "bulkAction");
  if (itemIds.length === 0) {
    return { message: "Chưa chọn mục nào.", variant: "error" };
  }

  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  const note = textValue(formData, "note") || null;

  if (bulkAction === "approve") {
    const result = await service.bulkApprove(
      itemIds,
      parseApproveInput(formData, user.id),
    );
    await afterCrawlReviewMutation(result.publishedSlugs);
    return {
      message:
        result.failed.length === 0
          ? `Đã duyệt ${result.succeeded.length} văn bản.`
          : `Đã duyệt ${result.succeeded.length} văn bản, ${result.failed.length} lỗi.`,
      variant: result.succeeded.length > 0 ? "success" : "error",
    };
  }

  if (bulkAction === "reject") {
    const result = await service.bulkReject(itemIds, {
      actorId: user.id,
      note,
    });
    await afterCrawlReviewMutation();
    return {
      message:
        result.failed.length === 0
          ? `Đã từ chối ${result.succeeded.length} văn bản.`
          : `Đã từ chối ${result.succeeded.length} văn bản, ${result.failed.length} lỗi.`,
      variant: result.succeeded.length > 0 ? "success" : "error",
    };
  }

  if (bulkAction === "archive") {
    const result = await service.bulkArchive(itemIds, {
      actorId: user.id,
      note,
    });
    await afterCrawlReviewMutation();
    return {
      message:
        result.failed.length === 0
          ? `Đã lưu trữ ${result.succeeded.length} văn bản.`
          : `Đã lưu trữ ${result.succeeded.length} văn bản, ${result.failed.length} lỗi.`,
      variant: result.succeeded.length > 0 ? "success" : "error",
    };
  }

  return { message: "Thao tác không hợp lệ.", variant: "error" };
}

export async function purgeExpiredCrawlQueueAction(
  formData: FormData,
): Promise<ActionFeedback> {
  await requireLegalWrite();
  const mode = textValue(formData, "mode");
  const db = getDb();
  const result =
    mode === "all"
      ? await archiveAllPendingCrawlItems(db)
      : mode === "superseded"
        ? await purgeSupersededPendingCrawlItems(db)
        : await purgePendingCrawlQueue(db);
  revalidatePath("/admin/legal-crawler");
  await invalidateLegalContentCaches();
  return {
    message:
      result.archived > 0
        ? mode === "superseded"
          ? `Đã loại ${result.archived} văn bản trước 2023 đã có bản thay thế từ 2025.`
          : `Đã loại ${result.archived} văn bản khỏi hàng chờ.`
        : mode === "superseded"
          ? "Không có văn bản trước 2023 bị thay thế trong hàng chờ."
          : "Không còn văn bản cần loại trong hàng chờ.",
    variant: "success",
  };
}

export async function toggleCrawlSourceAction(formData: FormData) {
  await requireLegalWrite();
  const sourceId = textValue(formData, "sourceId");
  if (!sourceId) return;
  const active = formData.get("active") === "on";
  await getDb().crawlSource.update({
    where: { id: sourceId },
    data: { active },
  });
  revalidatePath("/admin/legal-crawler");
}

export async function toggleCrawlKeywordAction(formData: FormData) {
  await requireLegalWrite();
  const keywordId = textValue(formData, "keywordId");
  if (!keywordId) return;
  const active = formData.get("active") === "on";
  await getDb().crawlKeyword.update({
    where: { id: keywordId },
    data: { active },
  });
  revalidatePath("/admin/legal-crawler");
}

export async function addCrawlKeywordAction(formData: FormData) {
  await requireLegalWrite();
  const keyword = textValue(formData, "keyword");
  if (!keyword) return;
  await getDb().crawlKeyword.upsert({
    where: { keyword },
    update: { active: true },
    create: { keyword, active: true },
  });
  revalidatePath("/admin/legal-crawler");
}
