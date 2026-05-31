export type ConfidenceLevelDto = "HIGH" | "MEDIUM" | "LOW";

export type CitationDto = {
  title: string;
  documentId: string | null;
  faqId: string | null;
  documentChunkId: string | null;
  sourceUrl: string | null;
  legalArticle: string | null;
  legalClause: string | null;
};

export type AnswerCardDto = {
  shortAnswer: string;
  /** Luôn để trống — UI chỉ hiển thị một khối câu trả lời ngắn gọn. */
  detailedAnswer: string;
  citations: CitationDto[];
  confidenceLevel: ConfidenceLevelDto;
  needsHrReview: boolean;
  warnings: string[];
  suggestedFollowUpQuestions: string[];
  relatedFaqSlug?: string | null;
  relatedFaqId?: string | null;
};

export type SearchHitDto = {
  type: "faq" | "document_chunk";
  id: string;
  title: string;
  snippet: string;
  score: number;
  categorySlug?: string | null;
};

export type SearchResponseDto = {
  query: string;
  hits: SearchHitDto[];
  answer: AnswerCardDto;
};
