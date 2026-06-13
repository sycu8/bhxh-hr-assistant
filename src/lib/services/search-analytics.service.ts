import { getDb } from "@/lib/db/prisma";
import type { ConfidenceLevel } from "@prisma/client";

export type SearchLogInput = {
  question: string;
  answer?: string | null;
  confidenceLevel?: ConfidenceLevel | null;
  needsHrReview?: boolean;
  resultCount?: number;
  hasAnswer?: boolean;
  categorySlug?: string;
};

export async function logSearchQuery(input: SearchLogInput) {
  const db = getDb();
  const normalized = input.question.trim().toLocaleLowerCase("vi-VN");
  const noResult =
    (input.resultCount ?? 0) === 0 &&
    !input.hasAnswer &&
    !input.answer?.trim();

  return db.questionLog.create({
    data: {
      question: input.question.trim(),
      normalizedQuestion: normalized,
      answer: input.answer?.trim() || null,
      confidenceLevel: input.confidenceLevel ?? null,
      needsHrReview: input.needsHrReview ?? false,
      resultCount: input.resultCount ?? 0,
      hasAnswer: input.hasAnswer ?? Boolean(input.answer?.trim()),
      noResult,
      categorySlug: input.categorySlug ?? null,
    },
  });
}
