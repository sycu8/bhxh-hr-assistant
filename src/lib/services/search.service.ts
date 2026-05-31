import type {
  ChunkWithDocument,
  FaqWithCitations,
  IDocumentChunkReadRepository,
  IFaqReadRepository,
} from "@/lib/repositories/contracts";
import type { SearchHitDto, SearchResponseDto } from "@/lib/types/answer-card";
import type { VectorSearchProvider } from "@/lib/vector/vector-search.types";
import type { AiAnswerService } from "./ai-answer.service";

export type SearchServiceInput = {
  query: string;
  employeeGroup?: string;
  categorySlug?: string;
  hitLimit: number;
};

export class SearchService {
  constructor(
    private readonly faqRepo: IFaqReadRepository,
    private readonly chunkRepo: IDocumentChunkReadRepository,
    private readonly vector: VectorSearchProvider,
    private readonly ai: AiAnswerService,
  ) {}

  async search(input: SearchServiceInput): Promise<SearchResponseDto> {
    const question = input.query.trim();

    const [faqsRaw, vectorHits] = await Promise.all([
      this.faqRepo.searchApproved({
        query: question,
        categorySlug: input.categorySlug,
        take: input.hitLimit,
      }),
      this.vector.search(question, { limit: input.hitLimit }),
    ]);

    const faqsGrounded = faqsRaw.filter((f) => f.citations.length > 0);
    const chunks = await this.chunkRepo.findByIds(
      vectorHits.map((v) => v.chunkId),
    );
    const scoreByChunk = new Map(vectorHits.map((h) => [h.chunkId, h.score]));

    const faqHits = this.toFaqHits(faqsGrounded, question);
    const chunkHits = this.toChunkHits(chunks, scoreByChunk);

    const hits = [...faqHits, ...chunkHits]
      .sort((a, b) => b.score - a.score)
      .slice(0, input.hitLimit);

    const { card } = await this.ai.ask({
      question,
      employeeGroup: input.employeeGroup,
      categorySlug: input.categorySlug,
    });

    return { query: question, hits, answer: card };
  }

  private toFaqHits(faqs: FaqWithCitations[], question: string): SearchHitDto[] {
    return faqs.map((f) => ({
      type: "faq" as const,
      id: f.id,
      title: f.question,
      snippet: f.shortAnswer.slice(0, 220),
      score: simpleTextScore(question, f.question + " " + f.shortAnswer),
      categorySlug: f.category?.slug ?? null,
    }));
  }

  private toChunkHits(
    chunks: ChunkWithDocument[],
    scores: Map<string, number>,
  ): SearchHitDto[] {
    return chunks.map((c) => ({
      type: "document_chunk" as const,
      id: c.id,
      title: c.document.title,
      snippet: c.content.trim().slice(0, 220),
      score: scores.get(c.id) ?? 0,
      categorySlug: null,
    }));
  }
}

function simpleTextScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 1;
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return 0;
  let h = 0;
  for (const w of words) if (t.includes(w)) h++;
  return h / words.length;
}
