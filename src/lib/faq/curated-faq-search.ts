import {
  CURATED_FAQS,
  type CuratedFaq,
} from "@/lib/data/curated-faqs";

function tokenize(text: string): string[] {
  return text
    .toLocaleLowerCase("vi-VN")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);
}

export function scoreCuratedFaqMatch(question: string, faq: CuratedFaq): number {
  const q = question.toLocaleLowerCase("vi-VN").trim();
  const hay = [
    faq.question,
    faq.answer,
    faq.keywords.join(" "),
  ]
    .join(" ")
    .toLocaleLowerCase("vi-VN");

  if (hay.includes(q) || q.includes(faq.question.toLocaleLowerCase("vi-VN"))) {
    return 1;
  }

  const words = tokenize(q);
  if (words.length === 0) return 0;

  let hit = 0;
  for (const word of words) {
    if (hay.includes(word)) hit += 1;
  }

  const keywordBonus = faq.keywords.some((k) =>
    q.includes(k.toLocaleLowerCase("vi-VN")),
  )
    ? 0.15
    : 0;

  return Math.min(1, hit / words.length + keywordBonus);
}

export function searchCuratedFaqs(params: {
  query: string;
  categorySlug?: string;
  take?: number;
}): Array<{ faq: CuratedFaq; score: number }> {
  const take = params.take ?? 8;
  const pool = params.categorySlug
    ? CURATED_FAQS.filter((f) => f.categorySlug === params.categorySlug)
    : CURATED_FAQS;

  return pool
    .map((faq) => ({ faq, score: scoreCuratedFaqMatch(params.query, faq) }))
    .filter((row) => row.score >= 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, take);
}

/** Chỉ dùng FAQ curated khi điểm khớp đủ cao so với câu hỏi. */
export function isStrongCuratedMatch(
  question: string,
  faq: CuratedFaq,
  score: number,
): boolean {
  if (score < 0.28) return false;
  if (score >= 0.48) return true;
  const q = question.toLocaleLowerCase("vi-VN").trim();
  const fq = faq.question.toLocaleLowerCase("vi-VN");
  if (q.length >= 12 && (fq.includes(q) || q.includes(fq.slice(0, Math.min(24, fq.length))))) {
    return true;
  }
  return score >= 0.36;
}
