import { describe, expect, it } from "vitest";
import {
  composeConciseAnswer,
  extractRelevantExcerpt,
  formatAnswerForDisplay,
} from "@/lib/ai/answer-composer";

describe("answer-composer", () => {
  it("keeps normal short answers on one paragraph", () => {
    const short =
      "Từ 01/01/2027 phụ nữ mang thai được hỗ trợ gói sàng lọc Down, Edwards, Patau, Thalassemia – tối đa 900.000 đồng/trường hợp. Trẻ sơ sinh cũng được hưởng hỗ trợ gói dịch vụ sàng lọc theo quy định.";
    const formatted = formatAnswerForDisplay(short);
    expect(formatted).not.toContain("\n\n");
    expect(formatted).toContain("sàng lọc theo quy định.");
  });

  it("formats glued crawl text with line breaks", () => {
    const dense =
      "Theo Luật Bảo hiểm xã hội 2024, người lao động được tham gia BHXH tự nguyện khi tạm hoãn HĐLĐ nếu không có thỏa thuận đóng BHXH bắt buộc trong thời gian này.Bổ sung thêm đối tượng tham BHXH bắt buộcTheo quy định của Luật Bảo hiểm xã hội 2024 quy định về người lao động thuộc đối tượng tham gia BHXH bắt buộc gồm:- Người lao động là công dân Việt Nam:+ Người làm việc theo HĐLĐ không xác định thời hạn.";
    const formatted = formatAnswerForDisplay(dense);
    expect(formatted).toContain("này.\n\nBổ sung");
    expect(formatted).toContain("bắt buộc\n\nTheo quy định");
    expect(formatted).toContain("gồm:\n\n- Người");
    expect(formatted).toContain("Việt Nam:\n\n+ Người");
  });

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
