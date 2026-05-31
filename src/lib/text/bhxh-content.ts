const BHXH_HOTLINE_PATTERN = /Hotline:\s*1900\s*90\s*68\s*/gi;

/** Nhãn metadata trang chi tiết BHXH — xuống dòng trước mỗi nhãn để giống văn bản gốc. */
const BHXH_METADATA_LABELS = [
  "Số / Ký hiệu:",
  "Trích yếu:",
  "Loại văn bản:",
  "Cơ quan ban hành:",
  "Lĩnh vực:",
  "Tải tệp đính kèm:",
  "Người kí:",
  "Người ký:",
  "Ngày ban hành:",
  "Ngày có hiệu lực:",
  "Trạng thái văn bản:",
  "Nội dung văn bản",
  "Nội dung trong tệp đính kèm",
  "VĂN BẢN LIÊN QUAN",
] as const;

function collapseInlineWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripHotline(text: string): string {
  return text.replace(BHXH_HOTLINE_PATTERN, "");
}

/** Bỏ hotline và menu — gộp khoảng trắng (dùng cho tóm tắt). */
export function stripBhxhSiteBoilerplate(text: string): string {
  let clean = collapseInlineWhitespace(stripHotline(text));
  const anchor = clean.search(/(?:Trích yếu:|Số\s*\/\s*Ký hiệu:)/iu);
  if (anchor > 0) {
    clean = clean.slice(anchor).trim();
  }
  return collapseInlineWhitespace(stripHotline(clean));
}

/** Bỏ menu nhưng giữ xuống dòng có sẵn (nếu crawl/HTML còn \n). */
function stripBhxhSiteBoilerplatePreserveLines(text: string): string {
  let clean = stripHotline(text);
  const anchor = clean.search(/(?:Trích yếu:|Số\s*\/\s*Ký hiệu:)/iu);
  if (anchor > 0) {
    clean = clean.slice(anchor);
  }
  clean = stripHotline(clean);
  return clean
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Chèn xuống dòng theo cấu trúc trường metadata và điều/khoản/chương. */
export function formatLegalBodyForDisplay(text: string): string {
  let body = stripBhxhSiteBoilerplatePreserveLines(text);

  for (const label of BHXH_METADATA_LABELS) {
    const pattern = new RegExp(`\\s+(${escapeRegExp(label)})`, "gi");
    body = body.replace(pattern, "\n\n$1");
  }

  body = body.replace(/\s+(?=(?:QĐ|Quyết định|Nghị định|Thông tư)\s+)/gi, "\n\n");
  body = body.replace(/\s+(?=Điều\s+\d+[\.\:])/gi, "\n\n");
  body = body.replace(/\s+(?=Khoản\s+\d+[\.\:])/gi, "\n");
  body = body.replace(/\s+(?=Chương\s+[IVXLCDM\d]+[\.\:\s])/gi, "\n\n");
  body = body.replace(/\s+(?=\(\d{1,2}\/\d{1,2}\/\d{4}\))/g, "\n");

  return body
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Lấy phần trích yếu từ metadata trang chi tiết văn bản BHXH. */
export function extractBhxhTrichYeu(text: string): string | null {
  const match = text.match(/Trích yếu:\s*(.+?)\s+Loại văn bản:/iu);
  if (!match?.[1]) return null;
  return collapseInlineWhitespace(stripHotline(match[1])) || null;
}

export function extractTitleExcerpt(title: string): string | null {
  const parts = title
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  if (last.length < 12) return null;
  return stripHotline(last).trim() || null;
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

  return clipSummary(stripHotline(text), max);
}

export function cleanBhxhLegalBody(text: string): string {
  return formatLegalBodyForDisplay(text);
}

function clipSummary(text: string, max: number): string {
  const clean = collapseInlineWhitespace(text);
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max);
  const lastStop = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("? "),
  );
  return `${clipped.slice(0, lastStop > 160 ? lastStop + 1 : max).trim()}...`;
}
