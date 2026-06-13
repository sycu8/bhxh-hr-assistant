import { describe, expect, it } from "vitest";
import { isInsuranceLegalDocumentRelevant } from "@/lib/crawl/bhxh-legal-relevance";

describe("isInsuranceLegalDocumentRelevant", () => {
  it("keeps Nghị định về mức đóng BHXH", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "44/2017/NĐ-CP",
        body: "Trích yếu: Quy định mức đóng bảo hiểm xã hội bắt buộc và quỹ bảo hiểm tai nạn lao động Loại văn bản: Nghị định",
      }),
    ).toBe(true);
  });

  it("keeps hướng dẫn chế độ BHXH", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "998/BHXH-CSXH",
        body: "Trích yếu: V/v hướng dẫn thực hiện chính sách đối với người lao động khi chuyển đơn vị sự nghiệp Loại văn bản: Công văn Lĩnh vực: Văn bản trong Ngành",
      }),
    ).toBe(true);
  });

  it("drops thuốc & VTYT", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "50/QĐ-QLD",
        body: "Trích yếu: Về việc ban hành danh mục thuốc sản xuất trong nước Loại văn bản: Quyết định Lĩnh vực: Thuốc &VTYT",
      }),
    ).toBe(false);
  });

  it("drops đấu thầu thuốc", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "01/2016/ĐT-VTYT",
        body: "Trích yếu: Kết quả đấu thầu VTYT đợt 1 năm 2016 Loại văn bản: Khác Lĩnh vực: Kết quả đấu thầu thuốc tập trung quốc gia",
      }),
    ).toBe(false);
  });

  it("drops mọi kết quả đấu thầu theo loại văn bản", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "4-6/2017/KQ-ĐTT",
        body: "Trích yếu: Kết quả đấu thầu mua thuốc tháng 4 đến tháng 6 năm 2017 Loại văn bản: Kết quả đấu thầu thuốc & VTYT",
      }),
    ).toBe(false);
  });

  it("drops quy chế CNTT nội bộ dù có chữ BHXH trong cơ quan ban hành", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "123/QĐ-BHXH",
        body: "Trích yếu: Quyết định về việc ban hành Quy chế Bảo đảm an toàn thông tin trong ứng dụng công nghệ thông tin của Bảo hiểm xã hội Việt Nam Loại văn bản: Quyết định",
      }),
    ).toBe(false);
  });

  it("keeps quy trình giao dịch điện tử BHXH/BHYT/BHTN", () => {
    expect(
      isInsuranceLegalDocumentRelevant({
        title: "490/QĐ-BHXH",
        body: "Trích yếu: Ban hành Quy trình giao dịch điện tử trong lĩnh vực bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp Loại văn bản: Quyết định",
      }),
    ).toBe(true);
  });
});
