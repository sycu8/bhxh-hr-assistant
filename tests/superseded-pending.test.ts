import { describe, expect, it } from "vitest";
import {
  findSupersededPendingIds,
  hasReplacementFrom2025,
  isIssuedBefore2023,
  isIssuedFrom2025,
} from "@/lib/crawl/superseded-pending";

describe("superseded pending crawl items", () => {
  const oldDoc = {
    id: "old-1",
    title: "Nghị định hướng dẫn mức đóng bảo hiểm xã hội năm 2018",
    summary: "Quy định mức đóng BHXH cho doanh nghiệp",
    legalDocumentType: "DECREE",
    issuedDate: new Date("2018-06-01"),
    effectiveDate: new Date("2018-07-01"),
    detectedTopics: ["BHXH", "Doanh nghiệp"],
  };

  const newDoc = {
    id: "new-1",
    title: "Nghị định sửa đổi mức đóng bảo hiểm xã hội năm 2025",
    summary: "Thay thế quy định mức đóng BHXH cho doanh nghiệp",
    legalDocumentType: "DECREE",
    issuedDate: new Date("2025-07-01"),
    effectiveDate: new Date("2025-07-15"),
    detectedTopics: ["BHXH", "Doanh nghiệp"],
  };

  it("detects issuance years", () => {
    expect(isIssuedBefore2023(oldDoc)).toBe(true);
    expect(isIssuedFrom2025(newDoc)).toBe(true);
  });

  it("marks pre-2023 docs with 2025 replacement as superseded", () => {
    expect(hasReplacementFrom2025(oldDoc, [newDoc])).toBe(true);
    expect(findSupersededPendingIds([oldDoc], [newDoc])).toEqual(["old-1"]);
  });

  it("keeps pre-2023 docs without a 2025 replacement", () => {
    const unrelated = {
      ...newDoc,
      id: "new-2",
      title: "Thông tư hướng dẫn chế độ thai sản năm 2025",
      summary: "Quy định chế độ thai sản",
      detectedTopics: ["Thai sản"],
    };
    expect(hasReplacementFrom2025(oldDoc, [unrelated])).toBe(false);
  });
});
