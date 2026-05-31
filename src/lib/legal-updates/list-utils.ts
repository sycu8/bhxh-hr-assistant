export type LegalUpdateIssuanceFields = {
  issuedDate?: Date | string | null;
  effectiveDate?: Date | string | null;
  publishedAt?: Date | string | null;
};

export type LegalUpdateSearchFields = {
  title: string;
  summary?: string | null;
  documentNumber?: string | null;
  sourceName?: string | null;
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Ngày ban hành ưu tiên issuedDate, sau đó effectiveDate, cuối cùng publishedAt. */
export function getLegalUpdateIssuanceDate(
  row: LegalUpdateIssuanceFields,
): Date | null {
  return (
    toDate(row.issuedDate) ??
    toDate(row.effectiveDate) ??
    toDate(row.publishedAt) ??
    null
  );
}

export function getIssuanceTimeMs(row: LegalUpdateIssuanceFields): number {
  return getLegalUpdateIssuanceDate(row)?.getTime() ?? 0;
}

export function compareByIssuanceDesc(
  a: LegalUpdateIssuanceFields,
  b: LegalUpdateIssuanceFields,
): number {
  const diff = getIssuanceTimeMs(b) - getIssuanceTimeMs(a);
  if (diff !== 0) return diff;
  return 0;
}

export function matchesLegalUpdateSearch(
  row: LegalUpdateSearchFields,
  query: string,
): boolean {
  const q = query.trim().toLocaleLowerCase("vi-VN");
  if (!q) return true;
  const hay = [row.title, row.documentNumber, row.summary, row.sourceName]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("vi-VN");
  return hay.includes(q);
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function endOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

export function isWithinIssuanceRange(
  row: LegalUpdateIssuanceFields,
  from: Date | null,
  to: Date | null,
): boolean {
  if (!from && !to) return true;
  const issued = getLegalUpdateIssuanceDate(row);
  if (!issued) return false;
  const t = issued.getTime();
  if (from && t < startOfDay(from)) return false;
  if (to && t > endOfDay(to)) return false;
  return true;
}

export function parseDateInput(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
