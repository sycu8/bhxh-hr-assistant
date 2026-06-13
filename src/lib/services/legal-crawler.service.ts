import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import {
  detectInsuranceLegalTopics,
  INSURANCE_LEGAL_TOPIC_RULES,
  isInsuranceLegalDocumentRelevant,
} from "@/lib/crawl/bhxh-legal-relevance";

export type DiscoveredUrl = {
  url: string;
  title?: string;
};

export type ExtractedContent = {
  url: string;
  title: string;
  contentText: string;
  rawHtml?: string;
  publishedAt?: Date | null;
  issuedDate?: Date | null;
  effectiveDate?: Date | null;
  expiryDate?: Date | null;
};

export interface CrawlProviderAdapter {
  sourceKey: string;
  discoverUrls(
    source: CrawlSourceForCrawler,
    keywords: string[],
  ): Promise<DiscoveredUrl[]>;
  fetchAndExtract(url: string): Promise<ExtractedContent>;
}

export type CrawlSourceForCrawler = {
  id: string;
  name: string;
  baseUrl: string;
  domain: string;
  active: boolean;
};

export type CrawlItemDraft = {
  sourceId: string;
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  contentText: string;
  rawHtml?: string;
  summary: string;
  detectedTopics: string[];
  detectedKeywords: string[];
  legalDocumentType:
    | "LAW"
    | "DECREE"
    | "CIRCULAR"
    | "DECISION"
    | "OFFICIAL_DISPATCH"
    | "GUIDANCE"
    | "NEWS"
    | "OTHER";
  documentNumber?: string | null;
  issuedDate?: Date | null;
  effectiveDate?: Date | null;
  expiryDate?: Date | null;
  status: "NEW" | "PENDING_REVIEW";
  contentHash: string;
  crawledAt: Date;
};

export interface CrawlItemWriteRepository {
  findDuplicateByCanonicalUrl(
    canonicalUrl: string,
  ): Promise<{ id: string } | null>;
  findExistingCanonicalUrls(canonicalUrls: string[]): Promise<Set<string>>;
  findDuplicateByContentHash(contentHash: string): Promise<{ id: string } | null>;
  createPendingItem(draft: CrawlItemDraft): Promise<{ id: string }>;
  markSourceCrawled(sourceId: string, at: Date): Promise<void>;
}

export type CrawlRunResult = {
  discovered: number;
  created: number;
  duplicates: number;
  skippedIrrelevant: number;
  failed: number;
};

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
]);

const CRAWL_INGEST_CONCURRENCY = 8;

export function normalizeCrawlerUrl(input: string, baseUrl?: string): string {
  const url = new URL(input, baseUrl);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  url.searchParams.sort();
  const out = url.toString();
  return out.endsWith("/") && url.pathname !== "/" ? out.slice(0, -1) : out;
}

export function hashContent(content: string): string {
  return createHash("sha256")
    .update(content.trim().replace(/\s+/g, " ").toLowerCase())
    .digest("hex");
}

export function detectKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLocaleLowerCase("vi-VN");
  const out: string[] = [];
  for (const keyword of keywords) {
    if (lower.includes(keyword.toLocaleLowerCase("vi-VN"))) {
      out.push(keyword);
    }
  }
  return [...new Set(out)];
}

export function detectTopics(text: string): string[] {
  return detectInsuranceLegalTopics(text);
}

export { INSURANCE_LEGAL_TOPIC_RULES as TOPIC_RULES };

export function detectLegalDocumentType(
  title: string,
  content: string,
): CrawlItemDraft["legalDocumentType"] {
  const hay = `${title}\n${content.slice(0, 1000)}`.toLocaleLowerCase("vi-VN");
  if (/\bluật\b|luật số/.test(hay)) return "LAW";
  if (hay.includes("nghị định")) return "DECREE";
  if (hay.includes("thông tư")) return "CIRCULAR";
  if (hay.includes("quyết định")) return "DECISION";
  if (hay.includes("công văn")) return "OFFICIAL_DISPATCH";
  if (hay.includes("hướng dẫn")) return "GUIDANCE";
  if (hay.includes("tin") || hay.includes("chính sách")) return "NEWS";
  return "OTHER";
}

export function extractDocumentNumber(title: string): string | null {
  const match = title.match(
    /\b\d{1,5}\/[A-ZĐ-]+(?:-[A-ZĐ0-9]+)*(?:\b|(?=\s))/iu,
  );
  return match?.[0] ?? null;
}

import { summarizeLegalDocumentText } from "@/lib/text/bhxh-content";

export function summarizeText(text: string, max = 420): string {
  return summarizeLegalDocumentText(text, undefined, max);
}

function parseVietnameseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const numeric = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (numeric) {
    return new Date(Date.UTC(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])));
  }
  const words = raw.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/iu);
  if (words) {
    return new Date(Date.UTC(Number(words[3]), Number(words[2]) - 1, Number(words[1])));
  }
  return null;
}

export class GenericOfficialSourceAdapter implements CrawlProviderAdapter {
  sourceKey = "generic-official";

  async discoverUrls(
    source: CrawlSourceForCrawler,
    keywords: string[],
  ): Promise<DiscoveredUrl[]> {
    const res = await fetch(source.baseUrl, {
      headers: { "user-agent": "vn-insurance-fti-crawler/0.1" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const out: DiscoveredUrl[] = [];
    const keywordNeedles = keywords.map((k) => k.toLocaleLowerCase("vi-VN"));

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      let url: string;
      try {
        url = normalizeCrawlerUrl(href, source.baseUrl);
      } catch {
        return;
      }
      if (!new URL(url).hostname.endsWith(source.domain)) return;
      const title = $(el).text().replace(/\s+/g, " ").trim();
      const hay = `${title} ${url}`.toLocaleLowerCase("vi-VN");
      const relevant = keywordNeedles.some((k) => hay.includes(k));
      if (!relevant && out.length > 30) return;
      if (seen.has(url)) return;
      seen.add(url);
      out.push({ url, title: title || undefined });
    });

    if (out.length === 0) out.push({ url: normalizeCrawlerUrl(source.baseUrl) });
    return out.slice(0, 50);
  }

  async fetchAndExtract(url: string): Promise<ExtractedContent> {
    const res = await fetch(url, {
      headers: { "user-agent": "vn-insurance-fti-crawler/0.1" },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed for ${url}: ${res.status}`);
    }
    const rawHtml = await res.text();
    const $ = cheerio.load(rawHtml);
    $("script,style,noscript,svg,nav,footer,header,form").remove();
    const title =
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      url;
    const contentText = $("body").text().replace(/\s+/g, " ").trim();
    const publishedCandidate =
      $("meta[property='article:published_time']").attr("content") ||
      $("time").first().attr("datetime") ||
      $("time").first().text();
    const publishedAt =
      publishedCandidate && !Number.isNaN(Date.parse(publishedCandidate))
        ? new Date(publishedCandidate)
        : parseVietnameseDate(publishedCandidate);
    const effectiveDate = parseVietnameseDate(
      contentText.match(/có hiệu lực(?: thi hành)?(?: từ ngày)?[^0-9]*(.{0,40})/iu)?.[1],
    );

    return {
      url,
      title,
      contentText,
      rawHtml,
      publishedAt,
      issuedDate: publishedAt,
      effectiveDate,
    };
  }
}

export class BhxhLegalDocumentListAdapter
  extends GenericOfficialSourceAdapter
  implements CrawlProviderAdapter
{
  sourceKey = "bhxh-legal-document-list";

  async discoverUrls(source: CrawlSourceForCrawler): Promise<DiscoveredUrl[]> {
    const firstPageUrl = this.getListPageUrl(source.baseUrl);
    const firstPageHtml = await this.fetchListPage(firstPageUrl);
    const maxPage = this.findMaxPageNumber(firstPageHtml, firstPageUrl);
    return this.discoverPageRange(source, 1, maxPage, firstPageHtml);
  }

  async discoverPageRange(
    source: CrawlSourceForCrawler,
    pageStart: number,
    pageEnd: number,
    firstPageHtml?: string,
  ): Promise<DiscoveredUrl[]> {
    const firstPageUrl = this.getListPageUrl(source.baseUrl);
    const seen = new Set<string>();
    const out: DiscoveredUrl[] = [];
    const start = Math.max(1, Math.floor(pageStart));
    const end = Math.max(start, Math.floor(pageEnd));

    if (start === 1) {
      const html = firstPageHtml ?? (await this.fetchListPage(firstPageUrl));
      this.collectDocumentUrls(html, firstPageUrl, seen, out);
    }

    for (let page = Math.max(2, start); page <= end; page += 10) {
      const pageUrls = Array.from(
        { length: Math.min(10, end - page + 1) },
        (_, index) => this.withPage(firstPageUrl, page + index),
      );
      const htmlPages = await Promise.all(
        pageUrls.map((pageUrl) => this.fetchListPage(pageUrl)),
      );
      htmlPages.forEach((html, index) => {
        this.collectDocumentUrls(html, pageUrls[index], seen, out);
      });
    }

    return out;
  }

  async fetchAndExtract(url: string): Promise<ExtractedContent> {
    const res = await fetch(url, {
      headers: { "user-agent": "vn-insurance-fti-crawler/0.1" },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed for ${url}: ${res.status}`);
    }
    const rawHtml = await res.text();
    const $ = cheerio.load(rawHtml);
    $("script,style,noscript,svg,nav,footer,header").remove();
    const contentText = $("body").text().replace(/\s+/g, " ").trim();
    const documentNumber =
      contentText.match(/Số\s*\/\s*Ký hiệu:\s*([^:]+?)\s+Trích yếu:/iu)?.[1]?.trim() ??
      extractDocumentNumber(contentText) ??
      null;
    const excerpt =
      contentText.match(/Trích yếu:\s*(.+?)\s+Loại văn bản:/iu)?.[1]?.trim() ??
      "";
    const title = documentNumber && excerpt ? `${documentNumber}: ${excerpt}` : documentNumber ?? excerpt;
    const issuedDate = parseVietnameseDate(
      contentText.match(/Ngày ban hành:\s*(\d{1,2}\/\d{1,2}\/\d{4})/iu)?.[1],
    );
    const effectiveDate = parseVietnameseDate(
      contentText.match(/Ngày có hiệu lực:\s*(\d{1,2}\/\d{1,2}\/\d{4})/iu)?.[1],
    );

    return {
      url,
      title: title || $("title").text().trim() || url,
      contentText,
      rawHtml,
      issuedDate,
      effectiveDate,
    };
  }

  private getListPageUrl(baseUrl: string): string {
    const url = new URL(baseUrl);
    if (!url.pathname.toLocaleLowerCase("en-US").includes("/vanban")) {
      url.pathname = "/vanban/Pages/default.aspx";
    }
    url.hash = "";
    url.searchParams.delete("ItemID");
    url.searchParams.delete("Page");
    return normalizeCrawlerUrl(url.toString());
  }

  private withPage(listPageUrl: string, page: number): string {
    const url = new URL(listPageUrl);
    url.searchParams.set("Page", String(page));
    return normalizeCrawlerUrl(url.toString());
  }

  private async fetchListPage(url: string): Promise<string> {
    const res = await fetch(url, {
      headers: { "user-agent": "vn-insurance-fti-crawler/0.1" },
    });
    if (!res.ok) return "";
    return res.text();
  }

  private findMaxPageNumber(html: string, baseUrl: string): number {
    const $ = cheerio.load(html);
    let maxPage = 1;
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      try {
        const url = new URL(href, baseUrl);
        const page = Number(url.searchParams.get("Page"));
        if (Number.isInteger(page) && page > maxPage) {
          maxPage = page;
        }
      } catch {
        // Ignore invalid links emitted by the source CMS.
      }
    });
    return maxPage;
  }

  private collectDocumentUrls(
    html: string,
    baseUrl: string,
    seen: Set<string>,
    out: DiscoveredUrl[],
  ) {
    const $ = cheerio.load(html);
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      let url: URL;
      try {
        url = new URL(href, baseUrl);
      } catch {
        return;
      }
      if (!url.hostname.endsWith("baohiemxahoi.gov.vn")) return;
      if (!url.pathname.toLocaleLowerCase("en-US").includes("/vanban/")) return;
      if (!url.searchParams.has("ItemID")) return;
      url.hash = "";
      const normalized = normalizeCrawlerUrl(url.toString());
      if (seen.has(normalized)) return;
      seen.add(normalized);
      const title = $(el).text().replace(/\s+/g, " ").trim();
      out.push({ url: normalized, title: title || undefined });
    });
  }
}

export class OfficialSourceCrawlerService {
  constructor(
    private readonly deps: {
      adapter: CrawlProviderAdapter;
      itemRepo: CrawlItemWriteRepository;
      keywords: string[];
    },
  ) {}

  async crawlSource(source: CrawlSourceForCrawler): Promise<CrawlRunResult> {
    if (!source.active) {
      return {
        discovered: 0,
        created: 0,
        duplicates: 0,
        skippedIrrelevant: 0,
        failed: 0,
      };
    }
    const urls = await this.deps.adapter.discoverUrls(source, this.deps.keywords);
    return this.ingestDiscoveredUrls(source, urls);
  }

  async crawlManualUrl(
    source: CrawlSourceForCrawler,
    url: string,
  ): Promise<CrawlRunResult> {
    return this.ingestDiscoveredUrls(source, [{ url }]);
  }

  async crawlDiscoveredUrls(
    source: CrawlSourceForCrawler,
    urls: DiscoveredUrl[],
  ): Promise<CrawlRunResult> {
    return this.ingestDiscoveredUrls(source, urls);
  }

  private async ingestDiscoveredUrls(
    source: CrawlSourceForCrawler,
    urls: DiscoveredUrl[],
  ): Promise<CrawlRunResult> {
    const result: CrawlRunResult = {
      discovered: urls.length,
      created: 0,
      duplicates: 0,
      skippedIrrelevant: 0,
      failed: 0,
    };
    const now = new Date();

    const normalized = urls.map((candidate) => ({
      candidate,
      canonicalUrl: normalizeCrawlerUrl(candidate.url, source.baseUrl),
    }));
    const existingUrls = await this.deps.itemRepo.findExistingCanonicalUrls(
      normalized.map((entry) => entry.canonicalUrl),
    );
    const fresh = normalized.filter(
      (entry) => !existingUrls.has(entry.canonicalUrl),
    );
    result.duplicates += normalized.length - fresh.length;

    for (let i = 0; i < fresh.length; i += CRAWL_INGEST_CONCURRENCY) {
      const batch = fresh.slice(i, i + CRAWL_INGEST_CONCURRENCY);
      const outcomes = await Promise.all(
        batch.map(({ candidate, canonicalUrl }) =>
          this.ingestCandidate(source, candidate, canonicalUrl, now),
        ),
      );
      for (const outcome of outcomes) {
        result[outcome]++;
      }
    }

    await this.deps.itemRepo.markSourceCrawled(source.id, now);
    return result;
  }

  private async ingestCandidate(
    source: CrawlSourceForCrawler,
    candidate: DiscoveredUrl,
    canonicalUrl: string,
    now: Date,
  ): Promise<"created" | "duplicates" | "skippedIrrelevant" | "failed"> {
    try {
      const extracted = await this.deps.adapter.fetchAndExtract(canonicalUrl);
      if (!extracted.contentText.trim()) return "skippedIrrelevant";

      const textForDetection = `${extracted.title}\n${extracted.contentText}`;
      const detectedKeywords = detectKeywords(
        textForDetection,
        this.deps.keywords,
      );
      const relevant =
        detectedKeywords.length > 0 ||
        isInsuranceLegalDocumentRelevant({
          title: extracted.title,
          body: extracted.contentText,
          documentNumber: extractDocumentNumber(extracted.title),
        });
      if (!relevant) {
        return "skippedIrrelevant";
      }

      const contentHash = hashContent(extracted.contentText);
      const contentDupe =
        await this.deps.itemRepo.findDuplicateByContentHash(contentHash);
      if (contentDupe) return "duplicates";

      await this.deps.itemRepo.createPendingItem({
        sourceId: source.id,
        title: extracted.title || candidate.title || canonicalUrl,
        url: extracted.url || canonicalUrl,
        canonicalUrl,
        domain: new URL(canonicalUrl).hostname,
        contentText: extracted.contentText,
        summary: summarizeLegalDocumentText(
          extracted.contentText,
          extracted.title,
        ),
        detectedTopics: detectTopics(textForDetection),
        detectedKeywords,
        legalDocumentType: detectLegalDocumentType(
          extracted.title,
          extracted.contentText,
        ),
        documentNumber: extractDocumentNumber(extracted.title),
        issuedDate: extracted.issuedDate ?? extracted.publishedAt ?? null,
        effectiveDate: extracted.effectiveDate ?? null,
        expiryDate: extracted.expiryDate ?? null,
        status: "PENDING_REVIEW",
        contentHash,
        crawledAt: now,
      });
      return "created";
    } catch {
      return "failed";
    }
  }
}
