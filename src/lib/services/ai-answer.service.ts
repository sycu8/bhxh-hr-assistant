import { INSUFFICIENT_SOURCE_MESSAGE } from "@/lib/ai/constants";
import {
  appendLegalHint,
  composeConciseAnswer,
  emptyDetailedAnswer,
  extractRelevantExcerpt,
} from "@/lib/ai/answer-composer";
import { questionLikelyNeedsHrContext } from "@/lib/ai/sensitivity";
import type { CuratedFaq } from "@/lib/data/curated-faqs";
import { searchCuratedFaqs, isStrongCuratedMatch } from "@/lib/faq/curated-faq-search";
import type {
  ChunkWithDocument,
  FaqWithCitations,
  IDocumentChunkReadRepository,
  IFaqReadRepository,
} from "@/lib/repositories/contracts";
import type {
  AnswerCardDto,
  CitationDto,
  ConfidenceLevelDto,
} from "@/lib/types/answer-card";
import type { VectorSearchProvider } from "@/lib/vector/vector-search.types";
import { ConfidenceLevel } from "@prisma/client";

export type AskServiceInput = {
  question: string;
  employeeGroup?: string;
  categorySlug?: string;
};

function faqCitationsToDto(faq: FaqWithCitations): CitationDto[] {
  return faq.citations.map((c) => ({
    title: c.title,
    documentId: c.documentId,
    faqId: faq.id,
    documentChunkId: c.documentChunkId,
    sourceUrl: c.sourceUrl,
    legalArticle: c.legalArticle,
    legalClause: c.legalClause,
  }));
}

function curatedCitationsToDto(faq: CuratedFaq): CitationDto[] {
  return faq.citations.map((c) => ({
    title: c.title,
    documentId: null,
    faqId: null,
    documentChunkId: null,
    sourceUrl: c.sourceUrl,
    legalArticle: c.legalArticle ?? null,
    legalClause: c.legalClause ?? null,
  }));
}

function syntheticCitationFromChunk(chunk: ChunkWithDocument): CitationDto {
  const meta = (chunk.metadata ?? {}) as {
    legalArticle?: string;
    legalClause?: string;
    sourceUrl?: string;
  };
  return {
    title: chunk.document.title,
    documentId: chunk.document.id,
    faqId: null,
    documentChunkId: chunk.id,
    sourceUrl: meta.sourceUrl ?? null,
    legalArticle: meta.legalArticle ?? null,
    legalClause: meta.legalClause ?? null,
  };
}

function mergeCitations(list: CitationDto[]): CitationDto[] {
  const key = (c: CitationDto) =>
    `${c.faqId ?? ""}|${c.documentChunkId ?? ""}|${c.title}|${c.sourceUrl ?? ""}`;
  const map = new Map<string, CitationDto>();
  for (const c of list) {
    if (!map.has(key(c))) map.set(key(c), c);
  }
  return [...map.values()];
}

function lexicalFaqScore(question: string, faq: FaqWithCitations): number {
  const q = question.toLowerCase();
  const hay = `${faq.question} ${faq.shortAnswer}`.toLowerCase();
  if (hay.includes(q)) return 1;
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return 0;
  let hit = 0;
  for (const w of words) {
    if (hay.includes(w)) hit++;
  }
  return hit / words.length;
}

function confidenceFromScores(params: {
  faqScore: number;
  vectorScore: number;
  fromCurated: boolean;
}): ConfidenceLevelDto {
  const best = Math.max(params.faqScore, params.vectorScore);
  if (params.fromCurated && best >= 0.45) return "HIGH";
  if (best >= 0.55) return "HIGH";
  if (best >= 0.22) return "MEDIUM";
  return "LOW";
}

function needsHrReviewFromConfidence(c: ConfidenceLevelDto): boolean {
  return c === "LOW" || c === "MEDIUM";
}

function toPrismaConfidence(
  c: ConfidenceLevelDto,
): (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel] {
  return c as (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];
}

export class AiAnswerService {
  constructor(
    private readonly faqRepo: IFaqReadRepository,
    private readonly chunkRepo: IDocumentChunkReadRepository,
    private readonly vector: VectorSearchProvider,
  ) {}

  async ask(input: AskServiceInput): Promise<{
    card: AnswerCardDto;
    prismaConfidence: (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];
  }> {
    const question = input.question.trim();
    void input.employeeGroup;
    const sensitive = questionLikelyNeedsHrContext(question);

    const [curatedHits, faqsRaw, vectorHits] = await Promise.all([
      Promise.resolve(
        searchCuratedFaqs({
          query: question,
          categorySlug: input.categorySlug,
          take: 5,
        }),
      ),
      this.faqRepo.searchApproved({
        query: question,
        categorySlug: input.categorySlug,
        take: 12,
      }),
      this.vector.search(question, { limit: 10 }),
    ]);

    const bestCurated = curatedHits[0];
    const faqsGrounded = faqsRaw.filter((f) => f.citations.length > 0);

    let bestFaq: FaqWithCitations | undefined;
    let bestFaqScore = 0;
    for (const f of faqsGrounded) {
      const sc = lexicalFaqScore(question, f);
      if (sc > bestFaqScore) {
        bestFaqScore = sc;
        bestFaq = f;
      }
    }

    const chunkIds = vectorHits.map((h) => h.chunkId);
    const chunks = await this.chunkRepo.findByIds(chunkIds);
    const scoreByChunk = new Map(vectorHits.map((h) => [h.chunkId, h.score]));

    let bestChunk: ChunkWithDocument | undefined;
    let bestVector = 0;
    for (const ch of chunks) {
      const sc = scoreByChunk.get(ch.id) ?? 0;
      if (sc > bestVector) {
        bestVector = sc;
        bestChunk = ch;
      }
    }

    const citations: CitationDto[] = [];
    let shortAnswer = "";
    let relatedFaqSlug: string | null = null;
    let relatedFaqId: string | null = null;
    let fromCurated = false;
    let matchScore = 0;

    const curatedScore = bestCurated?.score ?? 0;
    const useCurated =
      bestCurated &&
      isStrongCuratedMatch(question, bestCurated.faq, curatedScore) &&
      (curatedScore >= bestFaqScore || curatedScore >= 0.4 || !bestFaq);

    const useFaq =
      !useCurated &&
      bestFaq &&
      (bestFaqScore >= bestVector || bestFaqScore >= 0.35 || !bestChunk);

    if (useCurated && bestCurated) {
      fromCurated = true;
      matchScore = curatedScore;
      relatedFaqSlug = bestCurated.faq.slug;
      citations.push(...curatedCitationsToDto(bestCurated.faq));
      shortAnswer = appendLegalHint(
        bestCurated.faq.answer,
        citations,
      );
    } else if (useFaq && bestFaq) {
      matchScore = bestFaqScore;
      relatedFaqId = bestFaq.id;
      citations.push(...faqCitationsToDto(bestFaq));
      const body =
        bestFaq.shortAnswer.trim() ||
        bestFaq.detailedAnswer?.trim() ||
        INSUFFICIENT_SOURCE_MESSAGE;
      shortAnswer = composeConciseAnswer({
        body,
        citations,
        question,
      });
    } else if (bestChunk && bestVector > 0) {
      matchScore = bestVector;
      citations.push(syntheticCitationFromChunk(bestChunk));
      const excerpt = extractRelevantExcerpt(bestChunk.content, question);
      shortAnswer = composeConciseAnswer({
        body: excerpt,
        citations,
        question,
      });
    }

    const mergedCitations = mergeCitations(citations);

    if (mergedCitations.length === 0) {
      const card: AnswerCardDto = {
        shortAnswer: INSUFFICIENT_SOURCE_MESSAGE,
        detailedAnswer: emptyDetailedAnswer(),
        citations: [],
        confidenceLevel: "LOW",
        needsHrReview: true,
        warnings: [
          "Không tìm thấy FAQ hoặc đoạn văn bản đã duyệt phù hợp đủ mạnh với câu hỏi.",
        ],
        suggestedFollowUpQuestions: [
          "Tôi cần chuẩn bị giấy tờ gì để HR xác nhận quyền lợi bảo hiểm?",
          "Mức đóng BHXH của tôi được tính trên khoản lương nào?",
        ],
        relatedFaqSlug: null,
        relatedFaqId: null,
      };
      return { card, prismaConfidence: ConfidenceLevel.LOW };
    }

    const confidenceLevel = confidenceFromScores({
      faqScore: matchScore,
      vectorScore: bestVector,
      fromCurated,
    });

    const warnings: string[] = [];
    if (needsHrReviewFromConfidence(confidenceLevel)) {
      warnings.push(
        "Mức độ tin cậy chưa cao: nên để HR/C&B xác minh trước khi áp dụng cho trường hợp cụ thể.",
      );
    }
    if (sensitive) {
      warnings.push(
        "Câu hỏi có thể liên quan dữ liệu cá nhân — không nhập thông tin nhạy cảm; vui lòng liên hệ HR/C&B.",
      );
    }

    const needsHrReview =
      needsHrReviewFromConfidence(confidenceLevel) || sensitive;

    const card: AnswerCardDto = {
      shortAnswer,
      detailedAnswer: emptyDetailedAnswer(),
      citations: mergedCitations,
      confidenceLevel,
      needsHrReview,
      warnings,
      suggestedFollowUpQuestions: relatedFaqSlug
        ? [
            `Xem thêm: ${bestCurated?.faq.question ?? "FAQ liên quan"}`,
            "Trường hợp của tôi có được hưởng trợ cấp thất nghiệp không?",
          ]
        : [
            "Trường hợp của tôi có được hưởng trợ cấp thất nghiệp không?",
            "Khi nghỉ việc, quyền lợi BHXH một lần được xử lý thế nào?",
          ],
      relatedFaqSlug,
      relatedFaqId,
    };

    return {
      card,
      prismaConfidence: toPrismaConfidence(confidenceLevel),
    };
  }
}

export function createAiAnswerService(deps: {
  faqRepo: IFaqReadRepository;
  chunkRepo: IDocumentChunkReadRepository;
  vector: VectorSearchProvider;
}) {
  return new AiAnswerService(deps.faqRepo, deps.chunkRepo, deps.vector);
}
