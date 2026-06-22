import { getDb } from "@/lib/db/prisma";
import { CACHE_KEYS } from "@/lib/cloudflare/cache-keys";
import { PUBLIC_CACHE_TTL_SEC, withKvJsonCache } from "@/lib/cloudflare/kv-json-cache";
import staticBhxhLegalUpdates from "@/lib/data/bhxh-published-legal-updates.json";
import { compareByIssuanceDesc } from "@/lib/legal-updates/list-utils";
import {
  cleanBhxhLegalBody,
  summarizeLegalDocumentText,
} from "@/lib/text/bhxh-content";

export type CrawlAdminItemRow = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  status: string;
  legalDocumentType: string | null;
  documentNumber: string | null;
  detectedKeywords: string[];
  detectedTopics: string[];
  crawledAt: Date;
  sourceName: string;
};

export type CrawlSourceAdminRow = {
  id: string;
  name: string;
  baseUrl: string;
  domain: string;
  sourceType: string;
  trustLevel: string;
  active: boolean;
  crawlFrequency: string;
  lastCrawledAt: Date | null;
};

export type CrawlKeywordAdminRow = {
  id: string;
  keyword: string;
  active: boolean;
  categoryName: string | null;
};

export type PublishedLegalUpdateRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  legalDocumentType: string | null;
  documentNumber: string | null;
  issuedDate: Date | null;
  effectiveDate: Date | null;
  impactLevel: string;
  affectedGroups: string[];
  hrActionRequired: boolean;
  hrActionSummary: string | null;
  publishedAt: Date | null;
};

export type PublishedLegalUpdateDetailRow = PublishedLegalUpdateRow & {
  body: string;
};

function jsonArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function cleanPublishedSummary(
  summary: string | null,
  title: string,
  body?: string | null,
): string | null {
  if (!summary && !body) return summary;
  const source = body?.trim() || summary?.trim() || "";
  if (!source) return summary;
  return summarizeLegalDocumentText(source, title);
}

function cleanPublishedBody(body: string | null): string {
  if (!body?.trim()) return body ?? "";
  return cleanBhxhLegalBody(body);
}

export async function getLegalCrawlerAdminData() {
  const db = getDb();
  try {
    const [items, sources, keywords, metrics] = await Promise.all([
      db.crawlItem.findMany({
        where: { status: { in: ["NEW", "PENDING_REVIEW"] } },
        orderBy: { crawledAt: "desc" },
        take: 25,
        include: { source: { select: { name: true } } },
      }),
      db.crawlSource.findMany({
        orderBy: [{ active: "desc" }, { name: "asc" }],
      }),
      db.crawlKeyword.findMany({
        orderBy: [{ active: "desc" }, { keyword: "asc" }],
        include: { category: { select: { name: true } } },
      }),
      Promise.all([
        db.crawlItem.count({ where: { status: { in: ["NEW", "PENDING_REVIEW"] } } }),
        db.crawlItem.count({ where: { status: "APPROVED" } }),
        db.crawlItem.count({ where: { status: "REJECTED" } }),
        db.legalUpdate.count({ where: { status: "PUBLISHED" } }),
      ]),
    ]);

    return {
      metrics: {
        pendingReview: metrics[0],
        approved: metrics[1],
        rejected: metrics[2],
        publishedLegalUpdates: metrics[3],
      },
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        summary: item.summary,
        status: item.status,
        legalDocumentType: item.legalDocumentType,
        documentNumber: item.documentNumber,
        detectedKeywords: jsonArray(item.detectedKeywords),
        detectedTopics: jsonArray(item.detectedTopics),
        crawledAt: item.crawledAt,
        sourceName: item.source.name,
      })) satisfies CrawlAdminItemRow[],
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        baseUrl: source.baseUrl,
        domain: source.domain,
        sourceType: source.sourceType,
        trustLevel: source.trustLevel,
        active: source.active,
        crawlFrequency: source.crawlFrequency,
        lastCrawledAt: source.lastCrawledAt,
      })) satisfies CrawlSourceAdminRow[],
      keywords: keywords.map((keyword) => ({
        id: keyword.id,
        keyword: keyword.keyword,
        active: keyword.active,
        categoryName: keyword.category?.name ?? null,
      })) satisfies CrawlKeywordAdminRow[],
    };
  } catch {
    return {
      metrics: {
        pendingReview: 0,
        approved: 0,
        rejected: 0,
        publishedLegalUpdates: 0,
      },
      items: [] as CrawlAdminItemRow[],
      sources: [] as CrawlSourceAdminRow[],
      keywords: [] as CrawlKeywordAdminRow[],
    };
  }
}

type PublishedLegalJsonRow = Omit<
  PublishedLegalUpdateRow,
  "publishedAt" | "effectiveDate" | "issuedDate"
> & {
  publishedAt: string | null;
  issuedDate?: string | null;
  effectiveDate: string | null;
};

type StaticPublishedLegalUpdateRow = PublishedLegalJsonRow & {
  body: string;
};

const staticPublishedRows = staticBhxhLegalUpdates as StaticPublishedLegalUpdateRow[];

function publishedToJson(rows: PublishedLegalUpdateRow[]): PublishedLegalJsonRow[] {
  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    issuedDate: r.issuedDate ? r.issuedDate.toISOString() : null,
    effectiveDate: r.effectiveDate ? r.effectiveDate.toISOString() : null,
  }));
}

function publishedFromJson(rows: PublishedLegalJsonRow[]): PublishedLegalUpdateRow[] {
  return rows.map((r) => {
    const effectiveDate = r.effectiveDate ? new Date(r.effectiveDate) : null;
    const issuedDate = r.issuedDate
      ? new Date(r.issuedDate)
      : effectiveDate;
    return {
      ...r,
      publishedAt: r.publishedAt ? new Date(r.publishedAt) : null,
      issuedDate,
      effectiveDate,
    };
  });
}

async function loadPublishedLegalUpdatesFromDb(): Promise<PublishedLegalUpdateRow[]> {
  const db = getDb();
  try {
    const rows = await db.legalUpdate.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: cleanPublishedSummary(row.summary, row.title, row.body),
      sourceUrl: row.sourceUrl,
      sourceName: row.sourceName,
      legalDocumentType: row.legalDocumentType,
      documentNumber: row.documentNumber,
      issuedDate: row.issuedDate,
      effectiveDate: row.effectiveDate,
      impactLevel: row.impactLevel,
      affectedGroups: jsonArray(row.affectedGroups),
      hrActionRequired: row.hrActionRequired,
      hrActionSummary: row.hrActionSummary,
      publishedAt: row.publishedAt,
    }));
  } catch {
    return [];
  }
}

function loadStaticPublishedLegalUpdates(): PublishedLegalUpdateRow[] {
  return publishedFromJson(staticPublishedRows).map((row) => {
    const staticRow = staticPublishedRows.find((item) => item.id === row.id);
    return {
      ...row,
      summary: cleanPublishedSummary(row.summary, row.title, staticRow?.body),
    };
  });
}

function loadStaticPublishedLegalUpdateDetailBySlug(
  slug: string,
): PublishedLegalUpdateDetailRow | null {
  const row = staticPublishedRows.find((item) => item.slug === slug);
  if (!row) return null;
  return {
    ...publishedFromJson([row])[0],
    summary: cleanPublishedSummary(row.summary, row.title, row.body),
    body: cleanPublishedBody(row.body),
  };
}

export async function getPublishedLegalUpdates(): Promise<
  PublishedLegalUpdateRow[]
> {
  const boxed = await withKvJsonCache(
    CACHE_KEYS.legalPublished50,
    PUBLIC_CACHE_TTL_SEC,
    async () => {
      const dbRows = await loadPublishedLegalUpdatesFromDb();
      return publishedToJson(
        dbRows.length > 0 ? dbRows : loadStaticPublishedLegalUpdates(),
      );
    },
  );
  return publishedFromJson(boxed).sort(compareByIssuanceDesc);
}

export async function getPublishedLegalUpdateBySlug(
  slug: string,
): Promise<PublishedLegalUpdateRow | null> {
  const db = getDb();
  try {
    const row = await db.legalUpdate.findFirst({
      where: { status: "PUBLISHED", slug },
    });
    if (!row) return loadStaticPublishedLegalUpdateDetailBySlug(slug);
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      sourceUrl: row.sourceUrl,
      sourceName: row.sourceName,
      legalDocumentType: row.legalDocumentType,
      documentNumber: row.documentNumber,
      issuedDate: row.issuedDate,
      effectiveDate: row.effectiveDate,
      impactLevel: row.impactLevel,
      affectedGroups: jsonArray(row.affectedGroups),
      hrActionRequired: row.hrActionRequired,
      hrActionSummary: row.hrActionSummary,
      publishedAt: row.publishedAt,
    };
  } catch {
    return loadStaticPublishedLegalUpdateDetailBySlug(slug);
  }
}

export async function getPublishedLegalUpdateDetailBySlug(
  slug: string,
): Promise<PublishedLegalUpdateDetailRow | null> {
  const db = getDb();
  try {
    const row = await db.legalUpdate.findFirst({
      where: { status: "PUBLISHED", slug },
    });
    if (!row) return loadStaticPublishedLegalUpdateDetailBySlug(slug);
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: cleanPublishedSummary(row.summary, row.title, row.body),
      sourceUrl: row.sourceUrl,
      sourceName: row.sourceName,
      legalDocumentType: row.legalDocumentType,
      documentNumber: row.documentNumber,
      issuedDate: row.issuedDate,
      effectiveDate: row.effectiveDate,
      impactLevel: row.impactLevel,
      affectedGroups: jsonArray(row.affectedGroups),
      hrActionRequired: row.hrActionRequired,
      hrActionSummary: row.hrActionSummary,
      publishedAt: row.publishedAt,
      body: cleanPublishedBody(row.body),
    };
  } catch {
    return loadStaticPublishedLegalUpdateDetailBySlug(slug);
  }
}
