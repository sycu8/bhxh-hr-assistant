/**
 * Văn bản và tóm tắt được HR duyệt — ưu tiên hiển thị trước kho BHXH crawl.
 * Gồm nghị định/luật mới và chính sách nội bộ FPT Telecom.
 */
export type CuratedLegalUpdate = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  legalDocumentType: string;
  documentNumber: string | null;
  issuedDate: string | null;
  effectiveDate: string | null;
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  affectedGroups: string[];
  hrActionRequired: boolean;
  hrActionSummary: string | null;
  publishedAt: string;
  body: string;
  /** true = chính sách FPT Telecom / FTEL, không phải văn bản Nhà nước */
  isInternalPolicy?: boolean;
};

export const CURATED_LEGAL_UPDATES: CuratedLegalUpdate[] = [
  {
    id: "curated-nd-168-2026",
    title:
      "Nghị định 168/2026/NĐ-CP — Chi tiết Luật Dân số (hiệu lực 01/7/2026)",
    slug: "nghi-dinh-168-2026-nd-cp-luat-dan-so",
    summary:
      "Quy định chi tiết Luật Dân số 2025: nghỉ thai sản khi sinh con thứ hai, thủ tục hưởng BHXH; từ 01/01/2027 hỗ trợ sàng lọc thai nghén tối đa 900.000 đồng/trường hợp.",
    sourceUrl:
      "https://luatvietnam.vn/tim-van-ban.html?keywords=Nghị%20định%20168%2F2026",
    sourceName: "LuatVietnam.vn",
    legalDocumentType: "DECREE",
    documentNumber: "168/2026/NĐ-CP",
    issuedDate: null,
    effectiveDate: "2026-07-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["HR", "CBNV"],
    hrActionRequired: true,
    hrActionSummary:
      "Cập nhật quy trình nghỉ thai sản con thứ hai và thông báo gói sàng lọc từ 2027.",
    publishedAt: "2026-05-31T00:00:00.000Z",
    body: `Nghị định 168/2026/NĐ-CP của Chính phủ quy định chi tiết một số điều và biện pháp tổ chức, hướng dẫn thi hành Luật Dân số (hiệu lực từ 01/7/2026).

Luật Dân số 2025 (113/2025/QH15):
• Lao động nữ: nghỉ 07 tháng khi sinh con.
• Lao động nam: nghỉ 10 ngày làm việc khi vợ sinh con.

Nghị định 168 — Điều kiện hưởng chế độ nghỉ thai sản khi sinh con thứ hai:
• Lao động nữ khi sinh con mà tại thời điểm sinh có một con đẻ còn sống.
• Lao động nam khi vợ sinh con mà tại thời điểm sinh, người vợ có một con đẻ còn sống.
• Không áp dụng với trường hợp lao động nữ mang thai từ đủ 22 tuần tuổi trở lên mà bị sảy thai, phá thai, thai chết trong tử cung, thai chết trong khi chuyển dạ.

Thủ tục: Hưởng chế độ nghỉ thai sản khi sinh con thứ hai thực hiện theo quy định về bảo hiểm xã hội.

Hỗ trợ sàng lọc (từ 01/01/2027):
Tất cả phụ nữ mang thai và trẻ sơ sinh được hưởng hỗ trợ gói dịch vụ sàng lọc.
• Phụ nữ mang thai được sàng lọc: Hội chứng Down, Edwards, Patau, bệnh Thalassemia (tan máu bẩm sinh).
• Mức hỗ trợ tối đa: 900.000 đồng/trường hợp.`,
  },
  {
    id: "curated-luong-co-so-2026-07",
    title: "Tăng lương cơ sở lên 2,53 triệu đồng/tháng (từ 01/7/2026)",
    slug: "tang-luong-co-so-2-53-trieu-2026",
    summary:
      "Từ 01/7/2026 mức lương cơ sở 2,53 triệu đồng/tháng. Trần căn cứ đóng BHXH bắt buộc cao nhất = 20 lần mức tham chiếu (50,6 triệu đồng/tháng) theo khoản 13 Điều 141 Luật BHXH.",
    sourceUrl:
      "https://luatvietnam.vn/tim-van-ban.html?keywords=lương%20cơ%20sở%202026",
    sourceName: "LuatVietnam.vn",
    legalDocumentType: "DECREE",
    documentNumber: null,
    issuedDate: null,
    effectiveDate: "2026-07-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["HR", "C&B"],
    hrActionRequired: true,
    hrActionSummary:
      "Rà soát mức đóng BHXH/BHYT/BHTN và cập nhật cấu hình tính lương từ 01/7/2026.",
    publishedAt: "2026-05-31T00:00:00.000Z",
    body: `Nghị định về tăng lương cơ sở (có hiệu lực từ ngày 01/7/2026):

• Từ 01/7/2026: Mức lương cơ sở tăng lên 2,53 triệu đồng/tháng.

• Với doanh nghiệp: Tiền lương làm căn cứ đóng bảo hiểm xã hội bắt buộc cao nhất bằng 20 lần mức tham chiếu tại thời điểm đóng.

Khoản 13 Điều 141 Luật Bảo hiểm xã hội: Khi chưa bãi bỏ mức lương cơ sở thì mức tham chiếu bằng mức lương cơ sở.

Từ 01/7/2026:
| Mức lương làm căn cứ đóng BHXH cao nhất | 50,6 triệu đồng/tháng |
| Lương cơ sở | 2,53 triệu đồng/tháng |

HR/C&B cần đối chiếu văn bản gốc trên Công báo và cập nhật bảng lương, kê khai BHXH.`,
  },
  {
    id: "curated-qd-1069-ftel-thai-san",
    title:
      "1069/QĐ-FTEL — Phụ lục 2: Cách tính trợ cấp thai sản từ Công ty (01/10/2023)",
    slug: "1069-qd-ftel-phu-luc-2-tro-cap-thai-san",
    summary:
      "FPT Telecom: công thức trợ cấp bổ sung thai sản từ Công ty theo nhóm nhân sự (CTL, chính sách 13 tháng, còn lại). Áp dụng cho CBNV FPT Telecom.",
    sourceUrl: "/calculators/che-do-thai-san",
    sourceName: "FPT Telecom — chính sách nội bộ",
    legalDocumentType: "DECISION",
    documentNumber: "1069/QĐ-FTEL",
    issuedDate: "2023-10-01T00:00:00.000Z",
    effectiveDate: "2023-10-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["HR", "C&B", "CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-05-31T00:00:00.000Z",
    isInternalPolicy: true,
    body: `PHỤ LỤC 2: CÁCH TÍNH TRỢ CẤP TỪ CÔNG TY (Quyết định 1069/QĐ-FTEL, hiệu lực 01/10/2023)

Công thức chung:
Trợ cấp từ Công ty = [ (75% × Lương trung bình × 6 − Trợ cấp từ BHXH) / Số ngày nghỉ theo chế độ ] × Số ngày nghỉ thực tế

1. Nhóm nhân sự tính theo CTL (kinh doanh, dịch vụ…):
• Lương trung bình: trung bình 03 tháng trước khi nghỉ thai sản (theo chính sách lương đã ban hành, không gồm hỗ trợ/đối ứng khác).
• Trần: 75% × Lương trung bình tối đa 15.000.000 đồng.

2. Nhóm áp dụng chính sách thu nhập 13 tháng:
• Lương trung bình: trung bình lương cơ bản 03 tháng trước khi nghỉ (không gồm lương khoán tháng và hỗ trợ khác).
• Trần: 75% × Lương trung bình không vượt mức lương tối đa đóng BHXH (20 lần lương cơ sở).

3. Các nhóm nhân sự còn lại:
• Lương trung bình: trung bình 03 tháng theo chính sách lương (không gồm hỗ trợ khác).
• Trần: 75% × Lương trung bình không vượt mức lương tối đa đóng BHXH.

Mức hưởng chế độ thai sản (nhóm 4, mục 2a):
Mức hưởng = Trợ cấp từ BHXH + Trợ cấp bổ sung từ Công ty (nếu có) + Chế độ hỗ trợ sinh con của Công ty (nếu có).

• Trợ cấp BHXH: do cơ quan BHXH chi trả theo Luật BHXH hiện hành.
• Trợ cấp bổ sung Công ty: theo Phụ lục 2 (gồm phần tương ứng BHTN mà Công ty đóng thay trong thời gian nghỉ).
• Hỗ trợ sinh con Công ty: chi một lần theo Quy định chế độ hỗ trợ sinh con từng thời kỳ.`,
  },
  {
    id: "curated-ftel-ho-tro-thai-san-2025",
    title:
      "Chính sách hỗ trợ thai sản FPT — Level 2/3/4 năm 2025 (FTEL)",
    slug: "ftel-ho-tro-thai-san-level-2025",
    summary:
      "FPT Telecom hỗ trợ sinh con một lần: Level 2 — 5 triệu; Level 3 — 15 triệu; Level 4 — 40 triệu đồng/lần sinh (2025). Cộng thêm BHXH và chế độ FTEL.",
    sourceUrl: "/calculators/che-do-thai-san",
    sourceName: "FPT Telecom — chính sách nội bộ",
    legalDocumentType: "OTHER",
    documentNumber: null,
    issuedDate: "2025-01-01T00:00:00.000Z",
    effectiveDate: "2025-01-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-05-31T00:00:00.000Z",
    isInternalPolicy: true,
    body: `THÔNG BÁO — Chế độ thai sản dành cho CBNV nữ FPT Telecom năm 2025

Đối tượng: CBNV nữ có hợp đồng lao động chính thức.

Chính sách hỗ trợ thai sản FPT (chi một lần khi sinh):
| Level | Mức hỗ trợ |
| Level 2 | 5.000.000 đồng/lần sinh |
| Level 3 | 15.000.000 đồng/lần sinh |
| Level 4 | 40.000.000 đồng/lần sinh |

Điều kiện chi trả:
• Chuyển khoản kỳ lương gần nhất sau khi CBNV cung cấp giấy chứng sinh hoặc giấy khai sinh.
• Khoản hỗ trợ là thu nhập chịu thuế TNCN.

Ngoài ra CBNV còn được hưởng:
• Chế độ thai sản từ BHXH (theo Luật BHXH).
• Chế độ thai sản FTEL và trợ cấp bổ sung Công ty (1069/QĐ-FTEL).

Tra cứu thêm trên Foxpro: Chức năng → Quy định và chính sách → Bảo hiểm xã hội.`,
  },
];
