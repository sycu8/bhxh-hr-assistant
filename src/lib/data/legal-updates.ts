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
