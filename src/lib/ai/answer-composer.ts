import type { CitationDto } from "@/lib/types/answer-card";

const MAX_ANSWER_CHARS = 520;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
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
    return sentences.slice(0, 2).join(" ").slice(0, maxChars);
  }

  return picked.join(" ");
}

export function appendLegalHint(
  answer: string,
  citations: CitationDto[],
): string {
  const clause = citations.find((c) => c.legalArticle)?.legalArticle;
  if (!clause) return normalizeWhitespace(answer);
  const base = normalizeWhitespace(answer);
  if (base.toLocaleLowerCase("vi-VN").includes(clause.toLocaleLowerCase("vi-VN"))) {
    return base;
  }
  return `${base} (Căn cứ: ${clause}.)`;
}

export function composeConciseAnswer(params: {
  body: string;
  citations: CitationDto[];
  question?: string;
}): string {
  const raw = params.question
    ? extractRelevantExcerpt(params.body, params.question)
    : normalizeWhitespace(params.body);

  const clipped =
    raw.length > MAX_ANSWER_CHARS
      ? `${raw.slice(0, MAX_ANSWER_CHARS - 1).trim()}…`
      : raw;

  return appendLegalHint(clipped, params.citations);
}

export function emptyDetailedAnswer(): string {
  return "";
}
