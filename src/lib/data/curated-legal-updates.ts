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
    hrActionRequired: false,
    hrActionSummary:
      "Đã có hiệu lực từ 01/7/2026 — duy trì quy trình nghỉ thai sản con thứ hai và thông báo gói sàng lọc từ 2027.",
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
    title: "Tăng lương cơ sở lên 2,53 triệu đồng/tháng (Nghị định 161/2026)",
    slug: "tang-luong-co-so-2-53-trieu-2026",
    summary:
      "Từ 01/7/2026 mức lương cơ sở 2,53 triệu đồng/tháng (Nghị định 161/2026/NĐ-CP). Trần căn cứ đóng BHXH bắt buộc = 20 lần mức tham chiếu (50,6 triệu đồng/tháng). Công cụ tính lương đã áp dụng mức mới.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-161-2026-ND-CP-quy-dinh-muc-luong-co-so-doi-voi-can-bo-cong-chuc-vien-chuc-va-luc-luong-vu-trang-706892.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "DECREE",
    documentNumber: "161/2026/NĐ-CP",
    issuedDate: null,
    effectiveDate: "2026-07-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["HR", "C&B"],
    hrActionRequired: false,
    hrActionSummary:
      "Đã có hiệu lực — công cụ tính lương và trang lương cơ bản đã cập nhật trần BHXH/BHYT 50,6 triệu.",
    publishedAt: "2026-07-01T00:00:00.000Z",
    body: `Nghị định 161/2026/NĐ-CP quy định mức lương cơ sở (có hiệu lực từ ngày 01/7/2026):

• Từ 01/7/2026: Mức lương cơ sở tăng lên 2,53 triệu đồng/tháng.

• Với doanh nghiệp: Tiền lương làm căn cứ đóng bảo hiểm xã hội bắt buộc cao nhất bằng 20 lần mức tham chiếu tại thời điểm đóng.

Khoản 13 Điều 141 Luật Bảo hiểm xã hội: Khi chưa bãi bỏ mức lương cơ sở thì mức tham chiếu bằng mức lương cơ sở.

Từ 01/7/2026:
| Mức lương làm căn cứ đóng BHXH cao nhất | 50,6 triệu đồng/tháng |
| Lương cơ sở | 2,53 triệu đồng/tháng |

Hệ thống đã cập nhật công cụ tính lương và trang tham chiếu lương cơ bản. HR/C&B vẫn cần đối chiếu văn bản gốc trên Công báo và cập nhật bảng lương, kê khai BHXH.`,
  },
  {
    id: "curated-vbhn-18-lao-dong-2026",
    title: "Văn bản hợp nhất 18/VBHN-VPQH — Bộ luật Lao động",
    slug: "vbhn-18-bo-luat-lao-dong-2026",
    summary:
      "Văn bản hợp nhất số 18/VBHN-VPQH (ban hành 12/2/2026) hợp nhất các quy định sửa đổi, bổ sung vào Bộ luật Lao động 2019 — căn cứ tra cứu lao động hiện hành.",
    sourceUrl:
      "https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-18-vbhn-vpqh-468971.htm",
    sourceName: "Công báo Chính phủ",
    legalDocumentType: "CONSOLIDATED",
    documentNumber: "18/VBHN-VPQH",
    issuedDate: "2026-02-12T00:00:00.000Z",
    effectiveDate: null,
    impactLevel: "MEDIUM",
    affectedGroups: ["HR", "CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-07-01T00:00:00.000Z",
    body: `Văn bản hợp nhất số 18/VBHN-VPQH do Văn phòng Quốc hội ban hành ngày 12/2/2026, hợp nhất Bộ luật Lao động.

Đây không phải Bộ luật Lao động mới thay thế toàn bộ, mà là văn bản hợp nhất các quy định đã sửa đổi, bổ sung vào Bộ luật Lao động 2019 — giúp tra cứu thống nhất.

HR nên dùng văn bản hợp nhất khi tư vấn về:
• Hợp đồng lao động, thời giờ làm việc, nghỉ phép.
• Chấm dứt hợp đồng, trách nhiệm người sử dụng lao động.
• Kỷ luật lao động và giải quyết tranh chấp.

Luôn đối chiếu văn bản gốc trên Công báo khi áp dụng cho từng tình huống cụ thể.`,
  },
  {
    id: "curated-nd-337-hdld-dien-tu",
    title: "Nghị định 337/2025/NĐ-CP — Hợp đồng lao động điện tử (từ 01/7/2026)",
    slug: "nghi-dinh-337-hop-dong-lao-dong-dien-tu",
    summary:
      "Từ 01/7/2026 nền tảng HĐLĐ điện tử vận hành chính thức. Doanh nghiệp được khuyến khích sử dụng; không bắt buộc chuyển đổi toàn bộ HĐLĐ giấy hiện có.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-337-2025-ND-CP-quy-dinh-chi-tiet-mot-so-dieu-cua-Bo-luat-Lao-dong-ve-hop-dong-lao-dong-dien-tu-648507.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "DECREE",
    documentNumber: "337/2025/NĐ-CP",
    issuedDate: null,
    effectiveDate: "2026-07-01T00:00:00.000Z",
    impactLevel: "MEDIUM",
    affectedGroups: ["HR", "CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-07-01T00:00:00.000Z",
    body: `Nghị định 337/2025/NĐ-CP quy định chi tiết hợp đồng lao động điện tử theo Bộ luật Lao động.

Từ 01/7/2026:
• Nền tảng hợp đồng lao động điện tử phải được đưa vào vận hành chính thức (Điều 28).
• Người sử dụng lao động được khuyến khích sử dụng HĐLĐ điện tử thay cho HĐLĐ giấy.

Lưu ý quan trọng:
• Không bắt buộc doanh nghiệp chuyển đổi toàn bộ HĐLĐ giấy sang điện tử.
• HĐLĐ điện tử đã giao kết trước 01/01/2026 còn hiệu lực thì tiếp tục thực hiện đến hết thời hạn.
• Không có quy định buộc phải ký lại hoặc chuyển đổi HĐLĐ đã giao kết trước đó.

HR có thể lên kế hoạch triển khai HĐLĐ điện tử khi phù hợp quy trình nội bộ, không cần chuyển đổi khẩn cấp toàn bộ hồ sơ.`,
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
  {
    id: "curated-luat-bhyt-2008",
    title: "Luật Bảo hiểm y tế 2008 (14/2008/QH12) — khung BHYT",
    slug: "luat-bao-hiem-y-te-2008",
    summary:
      "Luật nền về đối tượng tham gia BHYT, quyền và nghĩa vụ, thẻ BHYT, mức đóng và KCB. Đã được sửa đổi, bổ sung nhiều lần — áp dụng kèm Nghị định 146/2018.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Y-te-Lao-dong-Tien-luong/Luat-Bao-hiem-y-te-2008-so-14-2008-QH12-497.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "LAW",
    documentNumber: "14/2008/QH12",
    issuedDate: "2008-11-14T00:00:00.000Z",
    effectiveDate: null,
    impactLevel: "HIGH",
    affectedGroups: ["CBNV", "HR"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-06-22T00:00:00.000Z",
    body: `Luật Bảo hiểm y tế quy định:
• Đối tượng tham gia BHYT (người lao động, hưu trí, hộ gia đình…).
• Mức đóng và phương thức đóng BHYT.
• Thẻ BHYT, thời hạn sử dụng và cấp đổi.
• Quyền được KCB và thanh toán chi phí y tế từ quỹ BHYT.

HR/C&B: đảm bảo kê khai đúng, cập nhật nơi đăng ký KCB ban đầu, hướng dẫn NLĐ dùng thẻ điện tử/VssID.`,
  },
  {
    id: "curated-nd-146-2018-bhyt",
    title: "Nghị định 146/2018/NĐ-CP — chi tiết KCB BHYT",
    slug: "nghi-dinh-146-2018-bhyt-kcb",
    summary:
      "Quy định thủ tục khám chữa bệnh BHYT: đăng ký ban đầu, chuyển tuyến, mức đồng chi trả, thanh toán trực tiếp và danh mục dịch vụ.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Y-te-Lao-dong-Tien-luong/Nghi-dinh-146-2018-ND-CP-quy-dinh-chi-tiet-thi-hanh-mot-so-dieu-Luat-bao-hiem-y-te-359682.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "DECREE",
    documentNumber: "146/2018/NĐ-CP",
    issuedDate: "2018-10-17T00:00:00.000Z",
    effectiveDate: "2018-12-01T00:00:00.000Z",
    impactLevel: "HIGH",
    affectedGroups: ["CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-06-22T00:00:00.000Z",
    body: `Nghị định 146/2018 là căn cứ thường dùng khi NLĐ hỏi về:
• Nơi đăng ký KCB ban đầu và khám trái tuyến.
• Giấy chuyển tuyến, tái khám.
• Mức hưởng 80%/100% chi phí KCB theo từng trường hợp.

Khi trả lời nhân viên, luôn nhắc mang thẻ BHYT + giấy tờ tùy thân và tuân thủ quy trình chuyển tuyến.`,
  },
  {
    id: "curated-luat-viec-lam-bhtn",
    title: "Luật Việc làm — trợ cấp thất nghiệp (BHTN)",
    slug: "luat-viec-lam-tro-cap-that-nghiep",
    summary:
      "Điều 52–55 Luật Việc làm: điều kiện, mức trợ cấp, thời gian hưởng, học nghề và trách nhiệm báo cáo tìm việc khi hưởng BHTN.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Luat-Viec-lam-2013-38-2013-QH13-183193.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "LAW",
    documentNumber: "38/2013/QH13",
    issuedDate: "2013-11-16T00:00:00.000Z",
    effectiveDate: null,
    impactLevel: "HIGH",
    affectedGroups: ["CBNV"],
    hrActionRequired: false,
    hrActionSummary: null,
    publishedAt: "2026-06-22T00:00:00.000Z",
    body: `Tóm tắt BHTN theo Luật Việc làm:
• Đóng BHTN ≥12 tháng trong 24 tháng trước khi nghỉ.
• Nộp hồ sơ trong 03 tháng kể từ ngày chấm dứt HĐLĐ.
• Mức trợ cấp = 60% bình quân lương đóng BHTN 6 tháng liền kề.
• Thời gian hưởng tùy số tháng đã đóng (tối đa 12–18 tháng).

HR hỗ trợ cấp chứng nhận thời gian đóng BHTN và giải thích thủ tục tại trung tâm dịch vụ việc làm.`,
  },
  {
    id: "curated-nd-274-2025-bhtn",
    title: "Nghị định 274/2025/NĐ-CP — chậm/trốn đóng BHTN",
    slug: "nghi-dinh-274-2025-bhtn-cham-dong",
    summary:
      "Hướng dẫn xử lý chậm đóng, trốn đóng BHXH bắt buộc và BHTN; quy trình khiếu nại, tố cáo và trách nhiệm người sử dụng lao động.",
    sourceUrl:
      "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-274-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-cham-tron-dong-bao-hiem-xa-hoi-653507.aspx",
    sourceName: "Thư viện Pháp Luật",
    legalDocumentType: "DECREE",
    documentNumber: "274/2025/NĐ-CP",
    issuedDate: null,
    effectiveDate: null,
    impactLevel: "MEDIUM",
    affectedGroups: ["HR", "C&B"],
    hrActionRequired: true,
    hrActionSummary:
      "Rà soát kỳ trích nộp BHTN và xử lý các tháng chậm/trốn đóng.",
    publishedAt: "2026-06-22T00:00:00.000Z",
    body: `Nghị định 274/2025 được bài tổng hợp TLPL liệt kê trong nhóm văn bản BHXH/BHTN năm 2025–2026.

HR/C&B cần:
• Trích nộp BHTN đúng hạn cùng BHXH/BHYT.
• Lưu chứng từ nộp và đối chiếu sổ BHXH của NLĐ.
• Phối hợp BHXH khi NLĐ khiếu nại thiếu tháng đóng ảnh hưởng quyền hưởng trợ cấp thất nghiệp.`,
  },
];
