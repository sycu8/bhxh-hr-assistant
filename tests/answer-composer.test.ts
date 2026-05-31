import { describe, expect, it } from "vitest";
import {
  composeConciseAnswer,
  extractRelevantExcerpt,
} from "@/lib/ai/answer-composer";

describe("answer-composer", () => {
  it("extracts sentences relevant to the question", () => {
    const content =
      "Điều 1 quy định chung. Người lao động nghỉ không lương từ 14 ngày làm việc không đóng BHXH tháng đó. Quy định khác không liên quan.";
    const excerpt = extractRelevantExcerpt(
      content,
      "Nghỉ không lương 14 ngày có đóng BHXH không?",
    );
    expect(excerpt.toLowerCase()).toContain("14 ngày");
    expect(excerpt.length).toBeLessThan(400);
  });

  it("composes concise answer with legal hint", () => {
    const answer = composeConciseAnswer({
      body: "Có, trong phạm vi lao động phải tham gia BHXH theo luật.",
      citations: [
        {
          title: "Luật BHXH",
          documentId: null,
          faqId: null,
          documentChunkId: null,
          sourceUrl: null,
          legalArticle: "Điều 2",
          legalClause: null,
        },
      ],
    });
    expect(answer).toContain("Điều 2");
    expect(answer.length).toBeLessThan(600);
  });
});
