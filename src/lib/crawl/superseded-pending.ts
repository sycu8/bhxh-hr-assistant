export const SUPERSEDED_OLD_BEFORE = new Date("2023-01-01T00:00:00.000Z");
export const REPLACEMENT_ISSUED_FROM = new Date("2025-01-01T00:00:00.000Z");

export type CrawlDocReference = {
  id: string;
  title: string;
  summary?: string | null;
  documentNumber?: string | null;
  legalDocumentType?: string | null;
  issuedDate?: Date | null;
  effectiveDate?: Date | null;
  detectedTopics?: string[];
};

export const SUPERSEDED_PENDING_NOTE =
  "Tự động lưu trữ — văn bản trước 2023 đã có văn bản thay thế từ 2025.";

const STOP_WORDS = new Set([
  "van",
  "ban",
  "cua",
  "cho",
  "ve",
  "vao",
  "theo",
  "nam",
  "ngay",
  "muc",
  "quy",
  "dinh",
  "thong",
  "tu",
  "nghi",
  "luat",
  "ve",
  "cua",
  "va",
  "cac",
  "mot",
  "duoc",
  "trong",
  "tren",
  "duoi",
  "tu",
  "den",
  "tai",
  "bo",
  "co",
  "khong",
  "huong",
  "dan",
  "ve",
  "viec",
  "thuc",
  "hien",
  "ap",
  "dung",
  "doi",
  "voi",
  "nhan",
  "su",
  "dung",
  "lao",
  "dong",
  "bhxh",
  "bhyt",
  "bhtn",
]);

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("en-US");
}

export function getCrawlDocIssuanceDate(item: CrawlDocReference): Date | null {
  return item.issuedDate ?? item.effectiveDate ?? null;
}

export function inferCrawlDocIssuanceYear(item: CrawlDocReference): number | null {
  const issued = getCrawlDocIssuanceDate(item);
  if (issued) return issued.getUTCFullYear();

  const yearInTitle = item.title.match(/\bn[aă]m\s+(20\d{2}|19\d{2})\b/iu);
  if (yearInTitle) return Number(yearInTitle[1]);

  const yearInSummary = item.summary?.match(/\bn[aă]m\s+(20\d{2}|19\d{2})\b/iu);
  if (yearInSummary) return Number(yearInSummary[1]);

  return null;
}

export function isIssuedBefore2023(item: CrawlDocReference): boolean {
  const year = inferCrawlDocIssuanceYear(item);
  return year != null && year < 2023;
}

export function isIssuedFrom2025(item: CrawlDocReference): boolean {
  const issued = getCrawlDocIssuanceDate(item);
  if (issued) return issued >= REPLACEMENT_ISSUED_FROM;

  const year = inferCrawlDocIssuanceYear(item);
  return year != null && year >= 2025;
}

export function subjectTokens(item: CrawlDocReference): Set<string> {
  const raw = normalizeText(
    `${item.title} ${item.summary ?? ""}`.replace(/\b\d{1,5}\/[A-ZĐ-]+\b/giu, " "),
  )
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = raw
    .split(" ")
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

  return new Set(tokens);
}

function sharedTokenCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const token of a) {
    if (b.has(token)) count += 1;
  }
  return count;
}

function topicsOverlap(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return true;
  return a.some((topic) => b.includes(topic));
}

function mentionsReplacement(text: string, oldTokens: Set<string>): boolean {
  const normalized = normalizeText(text);
  if (!/(thay the|bai bo|sua doi|bo sung|thay the mot phan)/.test(normalized)) {
    return false;
  }
  let hits = 0;
  for (const token of oldTokens) {
    if (normalized.includes(token)) hits += 1;
  }
  return hits >= 2;
}

export function hasReplacementFrom2025(
  oldItem: CrawlDocReference,
  corpus: CrawlDocReference[],
): boolean {
  if (!isIssuedBefore2023(oldItem)) return false;

  const oldTokens = subjectTokens(oldItem);
  if (oldTokens.size === 0) return false;

  const oldTopics = oldItem.detectedTopics ?? [];

  for (const candidate of corpus) {
    if (candidate.id === oldItem.id) continue;
    if (!isIssuedFrom2025(candidate)) continue;
    if (!topicsOverlap(oldTopics, candidate.detectedTopics ?? [])) continue;

    const candidateTokens = subjectTokens(candidate);
    const shared = sharedTokenCount(oldTokens, candidateTokens);
    const minSize = Math.min(oldTokens.size, candidateTokens.size);
    const ratio = minSize > 0 ? shared / minSize : 0;

    const sameType =
      oldItem.legalDocumentType &&
      candidate.legalDocumentType &&
      oldItem.legalDocumentType === candidate.legalDocumentType;

    const subjectMatch =
      shared >= 3 || (shared >= 2 && ratio >= 0.45) || (sameType && shared >= 2);

    const replacementPhrase = mentionsReplacement(
      `${candidate.title} ${candidate.summary ?? ""}`,
      oldTokens,
    );

    if (subjectMatch || replacementPhrase) {
      return true;
    }
  }

  return false;
}

export function findSupersededPendingIds(
  pending: CrawlDocReference[],
  corpus: CrawlDocReference[],
): string[] {
  const fullCorpus = [...corpus];
  const pendingIds = new Set(pending.map((item) => item.id));

  for (const item of pending) {
    if (!pendingIds.has(item.id)) continue;
    if (!fullCorpus.some((row) => row.id === item.id)) {
      fullCorpus.push(item);
    }
  }

  return pending
    .filter((item) => hasReplacementFrom2025(item, fullCorpus))
    .map((item) => item.id);
}
