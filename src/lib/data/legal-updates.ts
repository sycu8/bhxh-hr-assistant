export type LegalUpdateItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  /** Gợi ý nguồn — nội dung thật do admin cập nhật */
  sourceHint: string;
  /** Đường dẫn tĩnh trong `public/` (ví dụ `/docs/van-ban.pdf`) */
  documentUrl?: string;
};

/** Dữ liệu minh họa — thay bằng CrawlItem / bản tin đã duyệt khi có module pháp lý */
export const LEGAL_UPDATES: LegalUpdateItem[] = [
  {
    id: "curated-luong-co-so-2026-07",
    date: "2026-07-01",
    title: "Lương cơ sở 2,53 triệu — trần BHXH 50,6 triệu (đã áp dụng)",
    summary:
      "Nghị định 161/2026/NĐ-CP có hiệu lực từ 01/7/2026. Công cụ tính lương và trang lương cơ bản đã cập nhật.",
    sourceHint: "Thư viện Pháp Luật",
    documentUrl: "/legal-updates/tang-luong-co-so-2-53-trieu-2026",
  },
  {
    id: "curated-nd-168-2026",
    date: "2026-07-01",
    title: "Nghị định 168/2026/NĐ-CP — Luật Dân số (đã có hiệu lực)",
    summary:
      "Nghỉ thai sản 7 tháng (nữ), 10 ngày (nam); điều kiện con thứ hai; hỗ trợ sàng lọc 900.000 đồng từ 2027.",
    sourceHint: "LuatVietnam.vn + tóm tắt HR",
    documentUrl: "/legal-updates/nghi-dinh-168-2026-nd-cp-luat-dan-so",
  },
  {
    id: "curated-nd-337-hdld-dien-tu",
    date: "2026-07-01",
    title: "Nghị định 337/2025 — Hợp đồng lao động điện tử",
    summary:
      "Nền tảng HĐLĐ điện tử vận hành từ 01/7/2026; khuyến khích sử dụng, không bắt buộc chuyển đổi toàn bộ HĐLĐ giấy.",
    sourceHint: "Thư viện Pháp Luật",
    documentUrl: "/legal-updates/nghi-dinh-337-hop-dong-lao-dong-dien-tu",
  },
  {
    id: "curated-vbhn-18-lao-dong-2026",
    date: "2026-07-01",
    title: "VBHN 18/VBHN-VPQH — Bộ luật Lao động hợp nhất",
    summary:
      "Văn bản hợp nhất các quy định sửa đổi Bộ luật Lao động 2019 — căn cứ tra cứu lao động.",
    sourceHint: "Công báo Chính phủ",
    documentUrl: "/legal-updates/vbhn-18-bo-luat-lao-dong-2026",
  },
  {
    id: "curated-ftel-ho-tro-thai-san-2025",
    date: "2026-05-31",
    title: "FPT — Hỗ trợ thai sản Level 2/3/4 năm 2025",
    summary:
      "Chính sách nội bộ FTEL: 5 / 15 / 40 triệu đồng theo Level, cộng BHXH và trợ cấp Công ty.",
    sourceHint: "FPT Telecom — chính sách nội bộ",
    documentUrl: "/calculators/che-do-thai-san",
  },
  {
    id: "tlpl-bhxh-tong-hop-20866",
    date: "2026-05-08",
    title: "TLPL — tổng hợp Luật BHXH 2026 & văn bản hướng dẫn",
    summary:
      "Đã nhập mục lục đầy đủ liên kết (VBHN 19/2026, Luật 2024, NĐ/TT kèm bài tỷ lệ đóng 2026) vào trang Mục lục PL; có thể đồng bộ FAQ có trích nguồn bằng lệnh import.",
    sourceHint:
      "Thư viện Pháp Luật — Pháp luật Doanh nghiệp (bài viết, mang tính tham khảo theo disclaimer trang nguồn).",
    documentUrl: "/nguon-phap-luat",
  },
  {
    id: "qd-366-bhxh-2026",
    date: "2026-04-29",
    title: "366/QĐ-BHXH — Quy trình thu BHXH, BHYT, BHTN (29/4/2026)",
    summary:
      "Theo trang bìa văn bản: ban hành Quy trình thu bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp; cấp sổ bảo hiểm xã hội, thẻ bảo hiểm y tế. Toàn văn đã có thể đưa vào kho tra cứu sau khi chạy OCR (pnpm run pdf:ocr-import); vẫn nên đối chiếu bản ký gốc khi áp dụng.",
    sourceHint:
      "BHXH Việt Nam — bản PDF đồng bộ /docs/366-QD-BHXH-2026.pdf (OCR vie+eng, có thể lệch ký tự ở vài chỗ).",
    documentUrl: "/docs/366-QD-BHXH-2026.pdf",
  },
  {
    id: "1",
    date: "2026-05-02",
    title: "Luật BHXH 2024 — hướng dẫn triển khai",
    summary:
      "Một số điều khoản về đối tượng tham gia và thủ tục hưởng chế độ đang được các bộ hướng dẫn chi tiết.",
    sourceHint: "Cổng thông tin BHXH Việt Nam",
  },
  {
    id: "2",
    date: "2026-04-18",
    title: "Cập nhật mức lương tối thiểu vùng",
    summary:
      "Mức lương tối thiểu vùng ảnh hưởng trực tiếp tới mức đóng bảo hiểm bắt buộc — HR cần rà soát bảng lương.",
    sourceHint: "Văn bản Chính phủ / địa phương",
  },
  {
    id: "3",
    date: "2026-03-10",
    title: "Điện tử hóa hồ sơ BHXH",
    summary:
      "Khuyến khích hoàn thiện hồ sơ điện tử để rút ngắn thời gian giải quyết quyền lợi cho NLĐ.",
    sourceHint: "Nội bộ HR/C&B",
  },
];
