import { describe, expect, it } from "vitest";
import {
  cleanBhxhLegalBody,
  extractBhxhTrichYeu,
  formatLegalBodyForDisplay,
  summarizeLegalDocumentText,
} from "@/lib/text/bhxh-content";

describe("bhxh content cleanup", () => {
  const noisy =
    "Hotline: 1900 90 68 TRANG CHỦ GIỚI THIỆU Cơ cấu tổ chức Trích yếu: 376/Ctr-BHXH: Chương trình Công tác tuyên truyền năm 2017. Loại văn bản: Văn bản trong Ngành";

  const fullMetadata =
    "Số / Ký hiệu: 376/Ctr-BHXH Trích yếu: 376/Ctr-BHXH: Chương trình Công tác tuyên truyền năm 2017. Loại văn bản: Văn bản trong Ngành Cơ quan ban hành: BHXH Việt Nam Ngày ban hành: 10/02/2017 Ngày có hiệu lực: 10/02/2017 Nội dung văn bản Điều 1. Phạm vi điều chỉnh. Điều 2. Đối tượng áp dụng.";

  it("extracts trich yeu without hotline or navigation", () => {
    expect(extractBhxhTrichYeu(noisy)).toBe(
      "376/Ctr-BHXH: Chương trình Công tác tuyên truyền năm 2017.",
    );
  });

  it("summarizes legal text from trich yeu instead of site menu", () => {
    const summary = summarizeLegalDocumentText(noisy);
    expect(summary).not.toContain("Hotline");
    expect(summary).not.toContain("TRANG CHỦ");
    expect(summary).toContain("Chương trình Công tác tuyên truyền");
  });

  it("cleans body from trich yeu anchor onward", () => {
    const body = cleanBhxhLegalBody(noisy);
    expect(body.startsWith("Trích yếu:")).toBe(true);
    expect(body).not.toContain("Hotline");
  });

  it("formats metadata and articles on separate lines", () => {
    const body = formatLegalBodyForDisplay(fullMetadata);
    expect(body).toContain("Số / Ký hiệu:");
    expect(body).toContain("\n\nLoại văn bản:");
    expect(body).toContain("\n\nNgày ban hành:");
    expect(body).toContain("\n\nĐiều 1.");
    expect(body).toContain("\n\nĐiều 2.");
    expect(body.split("\n").length).toBeGreaterThan(6);
  });
});
