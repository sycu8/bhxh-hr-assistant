-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EMPLOYEE', 'HR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EmployeeGroup" AS ENUM ('PROBATION', 'OFFICIAL', 'MANAGER');

-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('UPLOAD', 'CRAWL', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FaqStatus" AS ENUM ('DRAFT', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CrawlSourceType" AS ENUM ('OFFICIAL', 'GOVERNMENT', 'LEGAL_DATABASE', 'REFERENCE', 'NEWS');

-- CreateEnum
CREATE TYPE "CrawlTrustLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CrawlFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MANUAL');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('LAW', 'DECREE', 'CIRCULAR', 'DECISION', 'OFFICIAL_DISPATCH', 'GUIDANCE', 'NEWS', 'OTHER');

-- CreateEnum
CREATE TYPE "CrawlItemStatus" AS ENUM ('NEW', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LegalUpdateImpactLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LegalUpdateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceLabelType" AS ENUM ('OFFICIAL_LAW', 'INTERNAL_POLICY', 'REFERENCE_ARTICLE', 'HR_APPROVED');

-- CreateEnum
CREATE TYPE "PublishWorkflowStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_EMPLOYEE', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "CalculatorConfigStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "employeeGroup" "EmployeeGroup" NOT NULL DEFAULT 'OFFICIAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "question" TEXT NOT NULL,
    "shortAnswer" TEXT NOT NULL,
    "detailedAnswer" TEXT,
    "eligibility" TEXT,
    "benefits" TEXT,
    "requiredDocs" TEXT,
    "deadlineNote" TEXT,
    "steps" JSONB,
    "hrEscalation" TEXT,
    "relatedSlugs" JSONB,
    "sourceLabel" "SourceLabelType" NOT NULL DEFAULT 'HR_APPROVED',
    "previewToken" TEXT,
    "categoryId" TEXT,
    "status" "FaqStatus" NOT NULL DEFAULT 'DRAFT',
    "employeeGroup" "EmployeeGroup",
    "confidenceLevel" "ConfidenceLevel" NOT NULL DEFAULT 'HIGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT,
    "sourceType" "DocumentSourceType" NOT NULL DEFAULT 'UPLOAD',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "categoryId" TEXT,
    "storagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "faqId" TEXT,
    "documentId" TEXT,
    "documentChunkId" TEXT,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "legalArticle" TEXT,
    "legalClause" TEXT,
    "effectiveDate" TIMESTAMP(3),

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "question" TEXT NOT NULL,
    "normalizedQuestion" TEXT,
    "answer" TEXT,
    "confidenceLevel" "ConfidenceLevel",
    "needsHrReview" BOOLEAN NOT NULL DEFAULT false,
    "resultCount" INTEGER,
    "hasAnswer" BOOLEAN,
    "noResult" BOOLEAN NOT NULL DEFAULT false,
    "categorySlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sourceType" "CrawlSourceType" NOT NULL DEFAULT 'OFFICIAL',
    "trustLevel" "CrawlTrustLevel" NOT NULL DEFAULT 'HIGH',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "crawlFrequency" "CrawlFrequency" NOT NULL DEFAULT 'WEEKLY',
    "lastCrawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlKeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "rawHtml" TEXT,
    "summary" TEXT,
    "detectedTopics" JSONB,
    "detectedKeywords" JSONB,
    "legalDocumentType" "LegalDocumentType",
    "documentNumber" TEXT,
    "issuedDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "status" "CrawlItemStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "duplicateOfId" TEXT,
    "contentHash" TEXT NOT NULL,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalUpdate" (
    "id" TEXT NOT NULL,
    "crawlItemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "categoryId" TEXT,
    "legalDocumentType" "LegalDocumentType",
    "documentNumber" TEXT,
    "issuedDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "impactLevel" "LegalUpdateImpactLevel" NOT NULL DEFAULT 'MEDIUM',
    "affectedGroups" JSONB,
    "hrActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "hrActionSummary" TEXT,
    "status" "LegalUpdateStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "detail" TEXT,
    "topic" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "replyEmail" TEXT NOT NULL,
    "searchQuery" TEXT,
    "notifyEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" TEXT,
    "createdById" TEXT,
    "questionLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "HrTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroSummary" TEXT,
    "categoryId" TEXT,
    "status" "PublishWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "previewToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "formulaJson" JSONB NOT NULL,
    "status" "CalculatorConfigStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatorConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "status" "PublishWorkflowStatus" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL,
    "topicSlug" TEXT,
    "status" "PublishWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FAQ_slug_key" ON "FAQ"("slug");

-- CreateIndex
CREATE INDEX "FAQ_status_idx" ON "FAQ"("status");

-- CreateIndex
CREATE INDEX "FAQ_question_idx" ON "FAQ"("question");

-- CreateIndex
CREATE INDEX "FAQ_slug_idx" ON "FAQ"("slug");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "QuestionLog_createdAt_idx" ON "QuestionLog"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionLog_noResult_idx" ON "QuestionLog"("noResult");

-- CreateIndex
CREATE INDEX "CrawlSource_active_idx" ON "CrawlSource"("active");

-- CreateIndex
CREATE INDEX "CrawlSource_domain_idx" ON "CrawlSource"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlSource_domain_baseUrl_key" ON "CrawlSource"("domain", "baseUrl");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlKeyword_keyword_key" ON "CrawlKeyword"("keyword");

-- CreateIndex
CREATE INDEX "CrawlKeyword_active_idx" ON "CrawlKeyword"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlItem_canonicalUrl_key" ON "CrawlItem"("canonicalUrl");

-- CreateIndex
CREATE INDEX "CrawlItem_sourceId_idx" ON "CrawlItem"("sourceId");

-- CreateIndex
CREATE INDEX "CrawlItem_status_idx" ON "CrawlItem"("status");

-- CreateIndex
CREATE INDEX "CrawlItem_contentHash_idx" ON "CrawlItem"("contentHash");

-- CreateIndex
CREATE INDEX "CrawlItem_domain_idx" ON "CrawlItem"("domain");

-- CreateIndex
CREATE INDEX "CrawlItem_crawledAt_idx" ON "CrawlItem"("crawledAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegalUpdate_crawlItemId_key" ON "LegalUpdate"("crawlItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalUpdate_slug_key" ON "LegalUpdate"("slug");

-- CreateIndex
CREATE INDEX "LegalUpdate_status_idx" ON "LegalUpdate"("status");

-- CreateIndex
CREATE INDEX "LegalUpdate_publishedAt_idx" ON "LegalUpdate"("publishedAt");

-- CreateIndex
CREATE INDEX "LegalUpdate_legalDocumentType_idx" ON "LegalUpdate"("legalDocumentType");

-- CreateIndex
CREATE INDEX "ReviewAuditLog_entityType_entityId_idx" ON "ReviewAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReviewAuditLog_createdAt_idx" ON "ReviewAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HrTicket_ticketNumber_key" ON "HrTicket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HrTicket_questionLogId_key" ON "HrTicket"("questionLogId");

-- CreateIndex
CREATE INDEX "HrTicket_status_idx" ON "HrTicket"("status");

-- CreateIndex
CREATE INDEX "HrTicket_createdAt_idx" ON "HrTicket"("createdAt");

-- CreateIndex
CREATE INDEX "HrTicket_ticketNumber_idx" ON "HrTicket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TopicPage_slug_key" ON "TopicPage"("slug");

-- CreateIndex
CREATE INDEX "TopicPage_status_idx" ON "TopicPage"("status");

-- CreateIndex
CREATE INDEX "CalculatorConfig_key_status_idx" ON "CalculatorConfig"("key", "status");

-- CreateIndex
CREATE INDEX "CalculatorConfig_effectiveFrom_idx" ON "CalculatorConfig"("effectiveFrom");

-- CreateIndex
CREATE INDEX "ContentVersion_entityType_entityId_idx" ON "ContentVersion"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_entityType_entityId_version_key" ON "ContentVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "CmsAuditLog_entityType_entityId_idx" ON "CmsAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "CmsAuditLog_createdAt_idx" ON "CmsAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "CmsAuditLog_actorId_idx" ON "CmsAuditLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_isInternal_idx" ON "MediaAsset"("isInternal");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTemplate_slug_key" ON "ChecklistTemplate"("slug");

-- CreateIndex
CREATE INDEX "ChecklistTemplate_status_idx" ON "ChecklistTemplate"("status");

-- CreateIndex
CREATE INDEX "ChecklistTemplate_topicSlug_idx" ON "ChecklistTemplate"("topicSlug");

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "FAQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_documentChunkId_fkey" FOREIGN KEY ("documentChunkId") REFERENCES "DocumentChunk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLog" ADD CONSTRAINT "QuestionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlKeyword" ADD CONSTRAINT "CrawlKeyword_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlItem" ADD CONSTRAINT "CrawlItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "CrawlSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlItem" ADD CONSTRAINT "CrawlItem_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlItem" ADD CONSTRAINT "CrawlItem_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "CrawlItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalUpdate" ADD CONSTRAINT "LegalUpdate_crawlItemId_fkey" FOREIGN KEY ("crawlItemId") REFERENCES "CrawlItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalUpdate" ADD CONSTRAINT "LegalUpdate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTicket" ADD CONSTRAINT "HrTicket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTicket" ADD CONSTRAINT "HrTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrTicket" ADD CONSTRAINT "HrTicket_questionLogId_fkey" FOREIGN KEY ("questionLogId") REFERENCES "QuestionLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicPage" ADD CONSTRAINT "TopicPage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculatorConfig" ADD CONSTRAINT "CalculatorConfig_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsAuditLog" ADD CONSTRAINT "CmsAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
