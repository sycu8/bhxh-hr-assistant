import { getPg } from "@/lib/db/pg";
import { DocumentChunkRepository } from "@/lib/repositories/document-chunk.repository";
import { FaqRepository } from "@/lib/repositories/faq.repository";
import { QuestionLogRepository } from "@/lib/repositories/question-log.repository";
import { AiAnswerService } from "@/lib/services/ai-answer.service";
import { CalculatorService } from "@/lib/services/calculator.service";
import { SearchService } from "@/lib/services/search.service";
import { MockLexicalVectorSearchProvider } from "@/lib/vector/mock-lexical-vector.provider";

export function getServerDeps() {
  const db = getPg();
  const faqRepo = new FaqRepository(db);
  const chunkRepo = new DocumentChunkRepository(db);
  const vectorProvider = new MockLexicalVectorSearchProvider(chunkRepo);
  const aiAnswerService = new AiAnswerService(faqRepo, chunkRepo, vectorProvider);
  const searchService = new SearchService(
    faqRepo,
    chunkRepo,
    vectorProvider,
    aiAnswerService,
  );
  const questionLogRepo = new QuestionLogRepository(db);
  const calculatorService = new CalculatorService();

  return {
    db,
    faqRepo,
    chunkRepo,
    vectorProvider,
    aiAnswerService,
    searchService,
    questionLogRepo,
    calculatorService,
  } as const;
}
