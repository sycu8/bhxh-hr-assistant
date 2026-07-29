import type { CitationDto } from "@/lib/types/answer-card";

const MAX_ANSWER_CHARS = 520;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function needsDenseFormatting(text: string): boolean {
  if (text.includes("\n")) return true;
  return (
    /[.!?…][\p{Lu}ĐTCBL]/u.test(text) ||
    /[^\s](?:Bổ sung thêm|Bổ sung|Theo quy định|Căn cứ|Lưu ý|Ngoài ra|Kết luận)/u.test(text) ||
    /:\s*[–\-+•]/u.test(text) ||
    /[^\n+]{8,}\+\s+/u.test(text)
  );
}

/** Tách câu trả lời crawl/import dính liền; câu trả lời ngắn bình thường giữ một đoạn. */
export function formatAnswerForDisplay(text: string): string {
  let s = text.replace(/\r\n/g, "\n").trim();
  if (!s) return s;

  if (!needsDenseFormatting(s)) {
    return s
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Câu dính liền sau dấu chấm (thiếu khoảng trắng khi import nguồn).
  s = s.replace(/([.!?…])(?=[\p{Lu}ĐTCBL])/gu, "$1\n\n");

  // Tiêu đề/mục mới dính liền vào đoạn trước (không tách cụm " theo quy định" trong câu).
  s = s.replace(
    /(?<=[^\s\n])(?=Bổ sung thêm|Bổ sung|Theo quy định|Căn cứ|Lưu ý|Ngoài ra|Kết luận)/gu,
    "\n\n",
  );
  s = s.replace(/(?<=[^\s\n\d])(?=Điều\s+\d+)/gu, "\n\n");
  s = s.replace(/(?<=[^\s\n\d])(?=Khoản\s+\d+)/gu, "\n\n");

  // Danh sách sau dấu hai chấm.
  s = s.replace(/:\s*([–\-+•])\s*/g, ":\n\n$1 ");
  s = s.replace(/([^\n])\s+([–\-])\s+(?=[\p{Lu}])/gu, "$1\n\n$2 ");
  s = s.replace(/([^\n+]{8,})\+\s+/g, "$1\n+ ");

  s = s
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");
  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

function splitSentences(text: string): string[] {
  return normalizeWhitespace(text)
    .split(/(?<=[.!?…])\s+/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

export function extractRelevantExcerpt(
  content: string,
  question: string,
  maxChars = MAX_ANSWER_CHARS,
): string {
  const sentences = splitSentences(content);
  if (sentences.length === 0) {
    return normalizeWhitespace(content).slice(0, maxChars);
  }

  const terms = question
    .toLocaleLowerCase("vi-VN")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2);

  const scored = sentences.map((sentence, index) => {
    const hay = sentence.toLocaleLowerCase("vi-VN");
    let score = index === 0 ? 0.05 : 0;
    for (const term of terms) {
      if (hay.includes(term)) score += 1;
    }
    return { sentence, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked: string[] = [];
  let length = 0;

  for (const row of scored) {
    if (row.score <= 0 && picked.length > 0) continue;
    if (length + row.sentence.length > maxChars) break;
    if (!picked.includes(row.sentence)) {
      picked.push(row.sentence);
      length += row.sentence.length;
    }
    if (picked.length >= 3) break;
  }

  if (picked.length === 0) {
    return formatAnswerForDisplay(
      sentences.slice(0, 2).join(" ").slice(0, maxChars),
    );
  }

  return formatAnswerForDisplay(picked.join(" "));
}

export function appendLegalHint(
  answer: string,
  citations: CitationDto[],
  options?: { alreadyFormatted?: boolean },
): string {
  const clause = citations.find((c) => c.legalArticle)?.legalArticle;
  const base = options?.alreadyFormatted
    ? answer.trim()
    : formatAnswerForDisplay(answer);
  if (!clause) return base;
  if (base.toLocaleLowerCase("vi-VN").includes(clause.toLocaleLowerCase("vi-VN"))) {
    return base;
  }
  return `${base}\n\n(Căn cứ: ${clause}.)`;
}

export function composeConciseAnswer(params: {
  body: string;
  citations: CitationDto[];
  question?: string;
}): string {
  const raw = params.question
    ? extractRelevantExcerpt(params.body, params.question)
    : formatAnswerForDisplay(normalizeWhitespace(params.body));

  const clipped =
    raw.length > MAX_ANSWER_CHARS
      ? `${raw.slice(0, MAX_ANSWER_CHARS - 1).trim()}…`
      : raw;

  return appendLegalHint(clipped, params.citations, { alreadyFormatted: true });
}

export function emptyDetailedAnswer(): string {
  return "";
}
