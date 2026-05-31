import { describe, expect, it } from "vitest";
import {
  cleanBhxhLegalBody,
  extractBhxhTrichYeu,
  summarizeLegalDocumentText,
} from "@/lib/text/bhxh-content";

describe("bhxh content cleanup", () => {
  const noisy =
    "Hotline: 1900 90 68 TRANG CHỦ GIỚI THIỆU Cơ cấu tổ chức Trích yếu: 376/Ctr-BHXH: Chương trình Công tác tuyên truyền năm 2017. Loại văn bản: Văn bản trong Ngành";

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
});
