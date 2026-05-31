import { describe, expect, it } from "vitest";
import { searchCuratedFaqs } from "@/lib/faq/curated-faq-search";

describe("searchCuratedFaqs", () => {
  it("finds FAQ about unpaid leave and BHXH", () => {
    const hits = searchCuratedFaqs({
      query: "nghỉ không lương 14 ngày có đóng bhxh không",
      take: 3,
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.faq.slug).toBe("nghi-khong-luong-14-ngay");
    expect(hits[0]?.score).toBeGreaterThan(0.3);
  });
});
