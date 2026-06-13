import { describe, expect, it, vi } from "vitest";
import { INSUFFICIENT_SOURCE_MESSAGE } from "@/lib/ai/constants";
import type {
  ChunkWithDocument,
  FaqWithCitations,
  IDocumentChunkReadRepository,
  IFaqReadRepository,
} from "@/lib/repositories/contracts";
import { AiAnswerService } from "@/lib/services/ai-answer.service";
import type { VectorSearchProvider } from "@/lib/vector/vector-search.types";

function mockFaq(overrides: Partial<FaqWithCitations> = {}): FaqWithCitations {
  const base = {
    id: "faq-1",
    question: "Có bắt buộc tham gia BHXH không?",
    shortAnswer: "Có, trong phạm vi lao động theo luật.",
    detailedAnswer: "Chi tiết theo Luật Lao động và Luật BHXH.",
    categoryId: null,
    status: "APPROVED" as const,
    employeeGroup: null,
    confidenceLevel: "HIGH" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    citations: [
      {
        id: "cit-1",
        faqId: "faq-1",
        documentId: null,
        documentChunkId: null,
        title: "Luật BHXH (mẫu)",
        sourceUrl: null,
        legalArticle: "Điều 2",
        legalClause: null,
        effectiveDate: null,
      },
    ],
    category: null,
  };
  return { ...base, ...overrides } as FaqWithCitations;
}

describe("AiAnswerService", () => {
  it("refuses knowledge answer when there are no approved citations or chunks", async () => {
    const faqRepo: IFaqReadRepository = {
      searchApproved: vi.fn().mockResolvedValue([]),
    };
    const chunkRepo: IDocumentChunkReadRepository = {
      findByIds: vi.fn().mockResolvedValue([]),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([]),
    };
    const vector: VectorSearchProvider = {
      search: vi.fn().mockResolvedValue([]),
    };
    const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
    const { card } = await svc.ask({
      question: "qwzxplmn abcdefghijklmnopqrst uvwxyz noop",
    });

    expect(card.shortAnswer).toBe(INSUFFICIENT_SOURCE_MESSAGE);
    expect(card.citations).toHaveLength(0);
    expect(card.needsHrReview).toBe(true);
    expect(card.confidenceLevel).toBe("LOW");
  });

  it("uses curated FAQ when DB row has no citations", async () => {
    const faqNoCit = mockFaq({
      citations: [],
      question: "BHXH là gì?",
      shortAnswer: "Không được dùng nếu không có citation.",
    });
    const faqRepo: IFaqReadRepository = {
      searchApproved: vi.fn().mockResolvedValue([faqNoCit]),
    };
    const chunkRepo: IDocumentChunkReadRepository = {
      findByIds: vi.fn().mockResolvedValue([]),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([]),
    };
    const vector: VectorSearchProvider = {
      search: vi.fn().mockResolvedValue([]),
    };
    const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
    const { card } = await svc.ask({ question: "Tôi có bắt buộc tham gia BHXH không?" });
    expect(card.citations.length).toBeGreaterThan(0);
    expect(card.shortAnswer).not.toBe(INSUFFICIENT_SOURCE_MESSAGE);
    expect(card.relatedFaqSlug).toBe("bat-buoc-tham-gia-bhxh");
  });

  it("returns grounded answer when FAQ has citations", async () => {
    const faq = mockFaq();
    const faqRepo: IFaqReadRepository = {
      searchApproved: vi.fn().mockResolvedValue([faq]),
    };
    const chunkRepo: IDocumentChunkReadRepository = {
      findByIds: vi.fn().mockResolvedValue([]),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([]),
    };
    const vector: VectorSearchProvider = {
      search: vi.fn().mockResolvedValue([]),
    };
    const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
    const { card } = await svc.ask({
      question: "Có bắt buộc tham gia BHXH không?",
    });
    expect(card.citations.length).toBeGreaterThan(0);
    expect(card.shortAnswer).not.toBe(INSUFFICIENT_SOURCE_MESSAGE);
    expect(card.needsHrReview).toBe(false);
    expect(card.confidenceLevel).toBe("HIGH");
  });

  it("sets needsHrReview when confidence is MEDIUM or LOW", async () => {
    const faq = mockFaq({
      question: "Chế độ XYZ rất đặc thù",
      shortAnswer: "Trả lời mẫu.",
      citations: [
        {
          id: "c2",
          faqId: "faq-1",
          documentId: null,
          documentChunkId: null,
          title: "Nguồn mẫu",
          sourceUrl: null,
          legalArticle: null,
          legalClause: null,
          effectiveDate: null,
        },
      ],
    });
    const faqRepo: IFaqReadRepository = {
      searchApproved: vi.fn().mockResolvedValue([faq]),
    };
    const chunk: ChunkWithDocument = {
      id: "ch-1",
      documentId: "doc-1",
      content: "Nội dung không liên quan nhiều đến câu hỏi",
      chunkIndex: 0,
      embedding: null,
      metadata: {},
      createdAt: new Date(),
      document: {
        id: "doc-1",
        title: "Văn bản mẫu",
        status: "APPROVED",
      },
    };
    const chunkRepo: IDocumentChunkReadRepository = {
      findByIds: vi.fn().mockImplementation(async (ids: string[]) =>
        ids.includes("ch-1") ? [chunk] : [],
      ),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([chunk]),
    };
    const vector: VectorSearchProvider = {
      search: vi.fn().mockResolvedValue([{ chunkId: "ch-1", score: 0.1 }]),
    };
    const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
    const { card } = await svc.ask({
      question: "qwzxplmn mocktest scenario alpha beta gamma",
    });
    expect(card.citations.length).toBeGreaterThan(0);
    expect(["MEDIUM", "LOW"]).toContain(card.confidenceLevel);
    expect(card.needsHrReview).toBe(true);
  });

  it("adds HR warning when question looks like personal data request", async () => {
    const faq = mockFaq({
      question: "CCCD dùng để làm gì trong BHXH?",
      shortAnswer: "Dùng để định danh trong hồ sơ.",
    });
    const faqRepo: IFaqReadRepository = {
      searchApproved: vi.fn().mockResolvedValue([faq]),
    };
    const chunkRepo: IDocumentChunkReadRepository = {
      findByIds: vi.fn().mockResolvedValue([]),
      listApprovedForRetrieval: vi.fn().mockResolvedValue([]),
    };
    const vector: VectorSearchProvider = {
      search: vi.fn().mockResolvedValue([]),
    };
    const svc = new AiAnswerService(faqRepo, chunkRepo, vector);
    const { card } = await svc.ask({ question: "Cho tôi xem CCCD của tôi trên hệ thống" });
    expect(card.needsHrReview).toBe(true);
    expect(card.warnings.some((w) => w.includes("cá nhân"))).toBe(true);
  });
});
