import { getDb } from "@/lib/db/prisma";
import { CrawlItemRepository } from "@/lib/repositories/crawl.repository";
import {
  BhxhLegalDocumentListAdapter,
  GenericOfficialSourceAdapter,
  OfficialSourceCrawlerService,
  type CrawlRunResult,
  type CrawlSourceForCrawler,
} from "@/lib/services/legal-crawler.service";

export function createAdapterForSource(source: CrawlSourceForCrawler) {
  const basePath = new URL(source.baseUrl).pathname.toLocaleLowerCase("en-US");
  if (
    source.domain === "baohiemxahoi.gov.vn" &&
    basePath.includes("/vanban")
  ) {
    return new BhxhLegalDocumentListAdapter();
  }
  return new GenericOfficialSourceAdapter();
}

export async function createCrawlerService(source: CrawlSourceForCrawler) {
  const db = getDb();
  const repo = new CrawlItemRepository(db);
  const keywords = await repo.listActiveKeywords();
  return {
    repo,
    service: new OfficialSourceCrawlerService({
      adapter: createAdapterForSource(source),
      itemRepo: repo,
      keywords,
    }),
  };
}

export type SourceCrawlOutcome = {
  sourceId: string;
  sourceName: string;
  result: CrawlRunResult;
  error?: string;
};

export type OfficialSourcesCrawlBatchResult = {
  startedAt: string;
  finishedAt: string;
  sources: SourceCrawlOutcome[];
  totals: CrawlRunResult;
};

export async function listScheduledOfficialSources(): Promise<
  CrawlSourceForCrawler[]
> {
  const repo = new CrawlItemRepository(getDb());
  return repo.listScheduledOfficialSources();
}

export async function runScheduledOfficialSourcesCrawl(): Promise<OfficialSourcesCrawlBatchResult> {
  const startedAt = new Date();
  const sources = await listScheduledOfficialSources();
  const outcomes: SourceCrawlOutcome[] = [];
  const totals: CrawlRunResult = {
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
      outcomes.push({
        sourceId: source.id,
        sourceName: source.name,
        result,
      });
      totals.discovered += result.discovered;
      totals.created += result.created;
      totals.duplicates += result.duplicates;
      totals.skippedIrrelevant += result.skippedIrrelevant;
      totals.failed += result.failed;
    } catch (error) {
      outcomes.push({
        sourceId: source.id,
        sourceName: source.name,
        result: {
          discovered: 0,
          created: 0,
          duplicates: 0,
          skippedIrrelevant: 0,
          failed: 1,
        },
        error: error instanceof Error ? error.message : "Unknown crawl error",
      });
      totals.failed += 1;
    }
  }

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    sources: outcomes,
    totals,
  };
}
