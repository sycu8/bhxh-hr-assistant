import { CrawlFrequency, CrawlSourceType, CrawlTrustLevel } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { deletePublicKvCache } from "@/lib/cloudflare/kv-json-cache";
import { CACHE_KEYS } from "@/lib/cloudflare/cache-keys";
import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";
import { getDb } from "@/lib/db/prisma";
import {
  CrawlItemRepository,
  CrawlReviewPrismaRepository,
} from "@/lib/repositories/crawl.repository";
import { CrawlReviewService } from "@/lib/services/crawl-review.service";
import {
  BhxhLegalDocumentListAdapter,
  OfficialSourceCrawlerService,
} from "@/lib/services/legal-crawler.service";

export const runtime = "nodejs";

const BHXH_DOCUMENTS_URL =
  "https://baohiemxahoi.gov.vn/vanban/pages/default.aspx";

function assertAuthorized(req: Request) {
  const env = tryGetCloudflareEnv();
  const secret =
    env?.CACHE_REVALIDATE_SECRET ?? process.env.CACHE_REVALIDATE_SECRET;
  if (!secret) {
    throw ApiError.serviceUnavailable(
      "Chưa cấu hình CACHE_REVALIDATE_SECRET.",
    );
  }
  if (req.headers.get("authorization")?.trim() !== `Bearer ${secret}`) {
    throw ApiError.unauthorized("Token không hợp lệ.");
  }
}

export const POST = withApiHandler(async (req: Request) => {
  assertAuthorized(req);
  const body = (await parseJsonBody<{
    pageStart?: number;
    pageEnd?: number;
    publishLimit?: number;
  }>(req)) ?? {};

  const pageStart = Math.max(1, Math.floor(body.pageStart ?? 1));
  const pageEnd = Math.max(pageStart, Math.floor(body.pageEnd ?? pageStart));
  const publishLimit = Math.max(1, Math.floor(body.publishLimit ?? 120));
  const db = getDb();

  const source = await db.crawlSource.upsert({
    where: {
      domain_baseUrl: {
        domain: "baohiemxahoi.gov.vn",
        baseUrl: BHXH_DOCUMENTS_URL,
      },
    },
    update: {
      name: "Danh mục văn bản BHXH Việt Nam",
      sourceType: CrawlSourceType.OFFICIAL,
      trustLevel: CrawlTrustLevel.HIGH,
      active: true,
      crawlFrequency: CrawlFrequency.DAILY,
    },
    create: {
      name: "Danh mục văn bản BHXH Việt Nam",
      baseUrl: BHXH_DOCUMENTS_URL,
      domain: "baohiemxahoi.gov.vn",
      sourceType: CrawlSourceType.OFFICIAL,
      trustLevel: CrawlTrustLevel.HIGH,
      active: true,
      crawlFrequency: CrawlFrequency.DAILY,
    },
    select: {
      id: true,
      name: true,
      baseUrl: true,
      domain: true,
      active: true,
    },
  });

  const crawlRepo = new CrawlItemRepository(db);
  const adapter = new BhxhLegalDocumentListAdapter();
  const urls = await adapter.discoverPageRange(source, pageStart, pageEnd);
  const crawler = new OfficialSourceCrawlerService({
    adapter,
    itemRepo: crawlRepo,
    keywords: await crawlRepo.listActiveKeywords(),
  });
  const crawlResult = await crawler.crawlDiscoveredUrls(source, urls);

  const pending = await db.crawlItem.findMany({
    where: { sourceId: source.id, status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    take: publishLimit,
    select: { id: true },
  });

  const review = new CrawlReviewService(new CrawlReviewPrismaRepository(db));
  let published = 0;
  let publishFailed = 0;
  for (const item of pending) {
    try {
      await review.approve(item.id, {
        note: "Xuất bản hàng loạt danh mục văn bản BHXH Việt Nam",
        impactLevel: "MEDIUM",
        affectedGroups: ["HR"],
        hrActionRequired: false,
      });
      published++;
    } catch {
      publishFailed++;
    }
  }

  await deletePublicKvCache([CACHE_KEYS.legalPublished50]);

  const [pendingReview, approved, publishedLegalUpdates] = await Promise.all([
    db.crawlItem.count({ where: { sourceId: source.id, status: "PENDING_REVIEW" } }),
    db.crawlItem.count({ where: { sourceId: source.id, status: "APPROVED" } }),
    db.legalUpdate.count({
      where: { crawlItem: { sourceId: source.id }, status: "PUBLISHED" },
    }),
  ]);

  return ok({
    pageStart,
    pageEnd,
    discoveredInBatch: urls.length,
    crawlResult,
    published,
    publishFailed,
    totals: {
      pendingReview,
      approved,
      publishedLegalUpdates,
    },
  });
});
