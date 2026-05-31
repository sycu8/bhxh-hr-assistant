const BHXH_HOTLINE_PATTERN = /Hotline:\s*1900\s*90\s*68\s*/gi;

/** Bỏ hotline và menu điều hướng trang baohiemxahoi.gov.vn khỏi văn bản crawl. */
export function stripBhxhSiteBoilerplate(text: string): string {
  let clean = text.replace(BHXH_HOTLINE_PATTERN, "").replace(/\s+/g, " ").trim();
  const anchor = clean.search(/(?:Trích yếu:|Số\s*\/\s*Ký hiệu:)/iu);
  if (anchor > 0) {
    clean = clean.slice(anchor).trim();
  }
  return clean.replace(BHXH_HOTLINE_PATTERN, "").replace(/\s+/g, " ").trim();
}

/** Lấy phần trích yếu từ metadata trang chi tiết văn bản BHXH. */
export function extractBhxhTrichYeu(text: string): string | null {
  const match = text.match(/Trích yếu:\s*(.+?)\s+Loại văn bản:/iu);
  if (!match?.[1]) return null;
  return match[1].replace(BHXH_HOTLINE_PATTERN, "").replace(/\s+/g, " ").trim() || null;
}

export function extractTitleExcerpt(title: string): string | null {
  const parts = title
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  if (last.length < 12) return null;
  return last.replace(BHXH_HOTLINE_PATTERN, "").trim() || null;
}

export function summarizeLegalDocumentText(
  text: string,
  title?: string,
  max = 420,
): string {
  const excerpt = extractBhxhTrichYeu(text);
  if (excerpt) return clipSummary(excerpt, max);

  const cleaned = stripBhxhSiteBoilerplate(text);
  if (cleaned.length >= 20) return clipSummary(cleaned, max);

  if (title) {
    const fromTitle = extractTitleExcerpt(title);
    if (fromTitle) return clipSummary(fromTitle, max);
  }

  return clipSummary(text.replace(BHXH_HOTLINE_PATTERN, ""), max);
}

export function cleanBhxhLegalBody(text: string): string {
  return stripBhxhSiteBoilerplate(text);
}

function clipSummary(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max);
  const lastStop = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
  );
  return `${clipped.slice(0, lastStop > 160 ? lastStop + 1 : max).trim()}...`;
}
