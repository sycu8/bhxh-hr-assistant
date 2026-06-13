import { describe, expect, it } from "vitest";
import {
  applyPublishedLegalHygiene,
  parseBhxhLegalIssuedDate,
  publishedRowToCrawlDocReference,
} from "@/lib/crawl/bhxh-published-legal-hygiene";

const baseRow = {
  slug: "test-slug",
  sourceUrl: "https://example.com",
  sourceName: "Test",
  legalDocumentType: "DECREE",
  documentNumber: "44/2017/NĐ-CP",
  effectiveDate: "2017-07-01T00:00:00.000Z",
  impactLevel: "MEDIUM",
  affectedGroups: ["HR"],
  hrActionRequired: false,
  hrActionSummary: null,
  publishedAt: "2026-05-31T00:00:00.000Z",
};

describe("bhxh published legal hygiene", () => {
  it("parses Ngày ban hành from BHXH metadata", () => {
    const date = parseBhxhLegalIssuedDate(
      "Ngày ban hành: 15/06/2017 Ngày có hiệu lực: 01/07/2017",
    );
    expect(date?.toISOString()).toBe("2017-06-15T00:00:00.000Z");
  });

  it("removes irrelevant drug procurement rows", () => {
    const rows = [
      {
        ...baseRow,
        id: "drug-1",
        title: "50/QĐ-QLD: danh mục thuốc",
        summary: "Thuốc",
        body: "Trích yếu: ban hành danh mục thuốc Loại văn bản: Quyết định Lĩnh vực: Thuốc &VTYT",
      },
      {
        ...baseRow,
        id: "bhxh-1",
        title: "44/2017/NĐ-CP: mức đóng BHXH",
        summary: "Mức đóng BHXH",
        body: "Trích yếu: Quy định mức đóng bảo hiểm xã hội bắt buộc Loại văn bản: Nghị định Ngày ban hành: 01/04/2017",
      },
    ];

    const result = applyPublishedLegalHygiene(rows);
    expect(result.kept.map((row) => row.id)).toEqual(["bhxh-1"]);
    expect(result.removedIrrelevant).toBe(1);
  });

  it("removes pre-2023 docs superseded by token match in 2025+ corpus", () => {
    const oldRow = {
      ...baseRow,
      id: "old-decree",
      title: "Nghị định hướng dẫn mức đóng bảo hiểm xã hội năm 2018",
      summary: "Quy định mức đóng BHXH cho doanh nghiệp",
      body: "Trích yếu: Quy định mức đóng bảo hiểm xã hội bắt buộc Loại văn bản: Nghị định Ngày ban hành: 01/06/2018",
      issuedDate: null,
      effectiveDate: "2018-07-01T00:00:00.000Z",
    };

    const result = applyPublishedLegalHygiene([oldRow], {
      replacementCorpus: [
        publishedRowToCrawlDocReference({
          ...baseRow,
          id: "new-decree",
          title: "Nghị định sửa đổi mức đóng bảo hiểm xã hội năm 2025",
          summary: "Thay thế quy định mức đóng BHXH cho doanh nghiệp",
          body: "Trích yếu: Thay thế quy định mức đóng bảo hiểm xã hội Loại văn bản: Nghị định Ngày ban hành: 01/07/2025",
          issuedDate: "2025-07-01T00:00:00.000Z",
          effectiveDate: "2025-07-15T00:00:00.000Z",
          slug: "new",
          documentNumber: "99/2025/NĐ-CP",
        }),
      ],
    });

    expect(result.kept).toHaveLength(0);
    expect(result.removedSuperseded).toBe(1);
  });

  it("removes pre-2023 mức đóng decree when 2026 lương cơ sở corpus exists", () => {
    const oldRow = {
      ...baseRow,
      id: "old-decree",
      title: "44/2017/NĐ-CP: Quy định mức đóng bảo hiểm xã hội bắt buộc",
      summary: "Mức đóng BHXH",
      body: "Trích yếu: Quy định mức đóng bảo hiểm xã hội bắt buộc Loại văn bản: Nghị định Ngày ban hành: 01/04/2017",
      issuedDate: null,
      effectiveDate: "2017-07-01T00:00:00.000Z",
    };

    const result = applyPublishedLegalHygiene([oldRow], {
      replacementCorpus: [
        publishedRowToCrawlDocReference({
          ...baseRow,
          id: "curated-luong-co-so",
          title: "Tăng lương cơ sở — trần đóng BHXH 20 lần mức tham chiếu",
          summary: "Từ 01/7/2026 trần căn cứ đóng BHXH bắt buộc = 20 lần mức tham chiếu",
          body: "Trích yếu: Tăng lương cơ sở và trần BHXH Loại văn bản: Nghị định Ngày ban hành: 01/07/2026",
          issuedDate: "2026-07-01T00:00:00.000Z",
          effectiveDate: "2026-07-01T00:00:00.000Z",
          slug: "luong-co-so",
          documentNumber: null,
        }),
      ],
    });

    expect(result.kept).toHaveLength(0);
    expect(result.removedSuperseded).toBe(1);
  });
});
