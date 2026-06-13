import {
  detectInsuranceLegalTopics,
  extractBhxhLegalTrichYeu,
  isInsuranceLegalDocumentRelevant,
} from "@/lib/crawl/bhxh-legal-relevance";
import {
  type CrawlDocReference,
  findSupersededPendingIds,
  getCrawlDocIssuanceDate,
  hasReplacementFrom2025,
  isIssuedBefore2023,
  isIssuedFrom2025,
} from "@/lib/crawl/superseded-pending";

/** Cụm chủ đề: văn bản 2025+ thay thế toàn bộ văn bản cũ cùng cụm. */
const SUPERSESSION_CLUSTERS: Array<{ terms: string[] }> = [
  {
    terms: [
      "mức đóng bảo hiểm",
      "mức đóng bhxh",
      "lương cơ sở",
      "mức tham chiếu",
      "trần đóng bhxh",
      "20 lần",
    ],
  },
  {
    terms: ["quy trình thu bhxh", "quy trình thu bảo hiểm", "366/qđ-bhxh"],
  },
  {
    terms: ["điều chỉnh lương hưu", "trợ cấp hàng tháng", "lương hưu"],
  },
  {
    terms: ["giao dịch điện tử", "tk1-ts", "tờ khai tham gia bhxh"],
  },
];

function normalizeClusterText(input: string): string {
  return input.toLocaleLowerCase("vi-VN").replace(/\s+/g, " ").trim();
}

function matchesCluster(text: string, terms: string[]): boolean {
  const haystack = normalizeClusterText(text);
  return terms.some((term) => haystack.includes(term.toLocaleLowerCase("vi-VN")));
}

function isSupersededByCluster(
  oldItem: CrawlDocReference,
  corpus: CrawlDocReference[],
): boolean {
  if (!isIssuedBefore2023(oldItem)) return false;

  const oldDate = getCrawlDocIssuanceDate(oldItem);
  const oldText = `${oldItem.title} ${oldItem.summary ?? ""}`;

  for (const cluster of SUPERSESSION_CLUSTERS) {
    if (!matchesCluster(oldText, cluster.terms)) continue;

    const replaced = corpus.some((candidate) => {
      if (candidate.id === oldItem.id) return false;
      const candidateDate = getCrawlDocIssuanceDate(candidate);
      if (oldDate && candidateDate && candidateDate <= oldDate) return false;
      if (!isIssuedFrom2025(candidate) && (!oldDate || !candidateDate)) {
        return false;
      }
      return matchesCluster(
        `${candidate.title} ${candidate.summary ?? ""}`,
        cluster.terms,
      );
    });

    if (replaced) return true;
  }

  return false;
}

function isSupersededByNewerPeer(
  oldItem: CrawlDocReference,
  corpus: CrawlDocReference[],
): boolean {
  const oldDate = getCrawlDocIssuanceDate(oldItem);
  if (!oldDate || !isIssuedBefore2023(oldItem)) return false;

  const oldText = `${oldItem.title} ${oldItem.summary ?? ""}`;

  return corpus.some((candidate) => {
    if (candidate.id === oldItem.id) return false;
    const candidateDate = getCrawlDocIssuanceDate(candidate);
    if (!candidateDate || candidateDate <= oldDate) return false;

    for (const cluster of SUPERSESSION_CLUSTERS) {
      if (
        matchesCluster(oldText, cluster.terms) &&
        matchesCluster(`${candidate.title} ${candidate.summary ?? ""}`, cluster.terms)
      ) {
        return true;
      }
    }
    return false;
  });
}

function findSupersededPublishedIds(
  refs: CrawlDocReference[],
  replacementCorpus: CrawlDocReference[],
): Set<string> {
  const oldRefs = refs.filter((row) => isIssuedBefore2023(row));
  const tokenSuperseded = new Set(
    findSupersededPendingIds(oldRefs, replacementCorpus),
  );
  const superseded = new Set<string>(tokenSuperseded);

  for (const oldRef of oldRefs) {
    if (
      tokenSuperseded.has(oldRef.id) ||
      hasReplacementFrom2025(oldRef, replacementCorpus) ||
      isSupersededByCluster(oldRef, replacementCorpus) ||
      isSupersededByNewerPeer(oldRef, refs)
    ) {
      superseded.add(oldRef.id);
    }
  }

  return superseded;
}

function dedupePublishedRows(
  rows: PublishedLegalHygieneRow[],
): { rows: PublishedLegalHygieneRow[]; removed: number } {
  const seen = new Map<string, PublishedLegalHygieneRow>();

  for (const row of rows) {
    const docKey = (row.documentNumber ?? row.slug).toLocaleLowerCase("vi-VN");
    const trichYeu = extractBhxhLegalTrichYeu(row.body, row.title)
      .toLocaleLowerCase("vi-VN")
      .slice(0, 120);
    const key = `${docKey}::${trichYeu}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, row);
      continue;
    }

    const existingDate = parseBhxhLegalIssuedDate(
      existing.body,
      existing.issuedDate ?? existing.effectiveDate,
    );
    const rowDate = parseBhxhLegalIssuedDate(
      row.body,
      row.issuedDate ?? row.effectiveDate,
    );
    if ((rowDate?.getTime() ?? 0) >= (existingDate?.getTime() ?? 0)) {
      seen.set(key, row);
    }
  }

  const deduped = [...seen.values()];
  return { rows: deduped, removed: rows.length - deduped.length };
}

export type PublishedLegalHygieneRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  legalDocumentType: string | null;
  documentNumber: string | null;
  issuedDate?: string | null;
  effectiveDate: string | null;
  impactLevel: string;
  affectedGroups: string[];
  hrActionRequired: boolean;
  hrActionSummary: string | null;
  publishedAt: string | null;
  body: string;
};

export type PublishedLegalHygieneResult = {
  kept: PublishedLegalHygieneRow[];
  removedIrrelevant: number;
  removedSuperseded: number;
  removedDuplicates: number;
  issuedDatesFixed: number;
};

function parseVietnameseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const numeric = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (numeric) {
    return new Date(
      Date.UTC(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])),
    );
  }
  return null;
}

/** Ngày ban hành từ metadata trang chi tiết BHXH.gov.vn. */
export function parseBhxhLegalIssuedDate(
  body: string,
  fallback?: string | Date | null,
): Date | null {
  const fromBody = parseVietnameseDate(
    body.match(/Ngày ban hành:\s*(\d{1,2}\/\d{1,2}\/\d{4})/iu)?.[1],
  );
  if (fromBody) return fromBody;

  if (fallback instanceof Date) return fallback;
  if (typeof fallback === "string" && fallback.trim()) {
    const parsed = new Date(fallback);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function publishedRowToCrawlDocReference(
  row: PublishedLegalHygieneRow,
): CrawlDocReference {
  const issuedDate = parseBhxhLegalIssuedDate(
    row.body,
    row.issuedDate ?? row.effectiveDate,
  );
  const trichYeu = extractBhxhLegalTrichYeu(row.body, row.title);

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    documentNumber: row.documentNumber,
    legalDocumentType: row.legalDocumentType,
    issuedDate,
    effectiveDate: row.effectiveDate ? new Date(row.effectiveDate) : null,
    detectedTopics: detectInsuranceLegalTopics(`${trichYeu}\n${row.title}`),
  };
}

function curatedCorpusRow(input: {
  id: string;
  title: string;
  summary: string;
  documentNumber: string | null;
  legalDocumentType: string;
  issuedDate: string | null;
  effectiveDate: string | null;
}): CrawlDocReference {
  const issuedDate = input.issuedDate
    ? new Date(input.issuedDate)
    : input.effectiveDate
      ? new Date(input.effectiveDate)
      : null;

  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    documentNumber: input.documentNumber,
    legalDocumentType: input.legalDocumentType,
    issuedDate,
    effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : null,
    detectedTopics: detectInsuranceLegalTopics(`${input.summary}\n${input.title}`),
  };
}

function withParsedIssuedDates(rows: PublishedLegalHygieneRow[]): {
  rows: PublishedLegalHygieneRow[];
  fixed: number;
} {
  let fixed = 0;
  const next = rows.map((row) => {
    const parsed = parseBhxhLegalIssuedDate(
      row.body,
      row.issuedDate ?? row.effectiveDate,
    );
    if (!parsed) return row;

    const iso = parsed.toISOString();
    if (row.issuedDate === iso) return row;
    fixed += 1;
    return { ...row, issuedDate: iso };
  });
  return { rows: next, fixed };
}

export function applyPublishedLegalHygiene(
  rows: PublishedLegalHygieneRow[],
  options?: {
    /** Văn bản HR duyệt từ 2025+ dùng làm corpus thay thế. */
    replacementCorpus?: CrawlDocReference[];
  },
): PublishedLegalHygieneResult {
  const { rows: datedRows, fixed: issuedDatesFixed } = withParsedIssuedDates(rows);

  const relevant = datedRows.filter((row) =>
      isInsuranceLegalDocumentRelevant({
        title: row.title,
        summary: row.summary ?? undefined,
        body: row.body,
        documentNumber: row.documentNumber,
      }),
  );
  const removedIrrelevant = datedRows.length - relevant.length;

  const { rows: deduped, removed: removedDuplicates } =
    dedupePublishedRows(relevant);

  const refs = deduped.map(publishedRowToCrawlDocReference);
  const replacementCorpus = [
    ...(options?.replacementCorpus ?? []),
    ...refs,
  ];

  const supersededIds = findSupersededPublishedIds(refs, replacementCorpus);
  const kept = deduped.filter((row) => !supersededIds.has(row.id));

  return {
    kept,
    removedIrrelevant,
    removedSuperseded: deduped.length - kept.length,
    removedDuplicates,
    issuedDatesFixed,
  };
}

export function buildCuratedReplacementCorpus(
  curatedRows: Array<{
    id: string;
    title: string;
    summary: string;
    documentNumber: string | null;
    legalDocumentType: string;
    issuedDate: string | null;
    effectiveDate: string | null;
    isInternalPolicy?: boolean;
  }>,
): CrawlDocReference[] {
  return curatedRows
    .filter((row) => !row.isInternalPolicy)
    .map(curatedCorpusRow)
    .filter((row) => isIssuedFrom2025(row));
}
