-- Composite indexes for crawl queue and published legal reads
CREATE INDEX IF NOT EXISTS "CrawlItem_status_crawledAt_idx" ON "CrawlItem"("status", "crawledAt" DESC);
CREATE INDEX IF NOT EXISTS "LegalUpdate_status_publishedAt_idx" ON "LegalUpdate"("status", "publishedAt" DESC);
