"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/prisma";
import {
  createCrawlerService,
} from "@/lib/crawl/crawl-runtime";
import {
  CrawlItemRepository,
  CrawlReviewPrismaRepository,
} from "@/lib/repositories/crawl.repository";
import type { CrawlSourceForCrawler } from "@/lib/services/legal-crawler.service";
import { CrawlReviewService } from "@/lib/services/crawl-review.service";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function runCrawlForSourceAction(formData: FormData) {
  const sourceId = textValue(formData, "sourceId");
  if (!sourceId) return;
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
  if (!source) return;
  const { service } = await createCrawlerService(source);
  await service.crawlSource(source);
  revalidatePath("/admin/legal-crawler");
}

export async function runCrawlAllSourcesAction() {
  const repo = new CrawlItemRepository(getDb());
  const sources = await repo.listActiveSources();
  for (const source of sources) {
    const { service } = await createCrawlerService(source);
    await service.crawlSource(source);
  }
  revalidatePath("/admin/legal-crawler");
}

export async function crawlManualUrlAction(formData: FormData) {
  const sourceId = textValue(formData, "sourceId");
  const url = textValue(formData, "url");
  if (!sourceId || !url) return;
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
  if (!source) return;
  const { service } = await createCrawlerService(source);
  await service.crawlManualUrl(source satisfies CrawlSourceForCrawler, url);
  revalidatePath("/admin/legal-crawler");
}

export async function approveCrawlItemAction(formData: FormData) {
  const itemId = textValue(formData, "itemId");
  if (!itemId) return;
  const affectedGroups = formData
    .getAll("affectedGroups")
    .filter((v): v is string => typeof v === "string");
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  await service.approve(itemId, {
    note: textValue(formData, "note") || null,
    impactLevel: (textValue(formData, "impactLevel") || "MEDIUM") as
      | "LOW"
      | "MEDIUM"
      | "HIGH",
    affectedGroups: affectedGroups.length > 0 ? affectedGroups : ["HR"],
    hrActionRequired: formData.get("hrActionRequired") === "on",
    hrActionSummary: textValue(formData, "hrActionSummary") || null,
  });
  revalidatePath("/admin/legal-crawler");
  revalidatePath("/cap-nhat-phap-luat");
}

export async function rejectCrawlItemAction(formData: FormData) {
  const itemId = textValue(formData, "itemId");
  if (!itemId) return;
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  await service.reject(itemId, { note: textValue(formData, "note") || null });
  revalidatePath("/admin/legal-crawler");
}

export async function archiveCrawlItemAction(formData: FormData) {
  const itemId = textValue(formData, "itemId");
  if (!itemId) return;
  const service = new CrawlReviewService(
    new CrawlReviewPrismaRepository(getDb()),
  );
  await service.archive(itemId, { note: textValue(formData, "note") || null });
  revalidatePath("/admin/legal-crawler");
}

export async function toggleCrawlSourceAction(formData: FormData) {
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
  const keyword = textValue(formData, "keyword");
  if (!keyword) return;
  await getDb().crawlKeyword.upsert({
    where: { keyword },
    update: { active: true },
    create: { keyword, active: true },
  });
  revalidatePath("/admin/legal-crawler");
}
