/**
 * Mục lục tham chiếu theo bài tổng hợp Thư viện Pháp Luật (Pháp luật Doanh nghiệp),
 * "Luật Bảo hiểm xã hội mới nhất 2026 và tổng hợp văn bản hướng dẫn" (08/05/2026).
 * Chỉ liệt kê URL & mô tả ngắn — không nhúng toàn văn văn bản quy phạm (bản quyền / Công báo).
 */
export const THUVIEN_BHXH_20866_SOURCE = {
  title:
    "Luật Bảo hiểm xã hội mới nhất 2026 và tổng hợp văn bản hướng dẫn",
  url: "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/luat-bao-hiem-xa-hoi-moi-nhat-2026-va-tong-hop-van-ban-huong-dan-20866.html",
  publisher: "Thư viện Pháp Luật (chuyên mục Pháp luật Doanh nghiệp)",
  retrievedNote:
    "Nội dung mục lục được đồng bộ theo cấu trúc bài viết; khi áp dụng hãy đối chiếu văn bản gốc trên Công báo / cơ quan có thẩm quyền.",
} as const;

export type CatalogLink = { label: string; href: string };

export type CatalogSection = {
  id: string;
  heading: string;
  links: CatalogLink[];
};

export const THUVIEN_BHXH_20866_SECTIONS: CatalogSection[] = [
  {
    id: "vbhn",
    heading: "Tải về — văn bản hợp nhất (theo bài viết)",
    links: [
      {
        label:
          "Văn bản hợp nhất 19/VBHN-VPQH năm 2026 hợp nhất Luật Bảo hiểm xã hội (tải từ TLPL)",
        href: "https://thuvienphapluat.vn/documents/download.aspx?id=EsX06W%2byciISGRsIJfEh%2bw%3d%3d&part=-1",
      },
    ],
  },
  {
    id: "luat-nen",
    heading: "Luật nền & luật sửa đổi, bổ sung (được bài viết dẫn)",
    links: [
      {
        label: "Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15) — trang tra cứu TLPL",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
      },
      {
        label: "Luật Dân số 2025 (113/2025/QH15) — chế độ thai sản, hiệu lực 01/7/2026",
        href: "https://thuvienphapluat.vn/van-ban/Van-hoa-Xa-hoi/Luat-dan-so-2025-so-113-2025-QH15-443680.aspx",
      },
    ],
  },
  {
    id: "luatvietnam",
    heading: "LuatVietnam.vn — nguồn crawl bổ sung (HR duyệt)",
    links: [
      {
        label: "LuatVietnam — tra cứu văn bản pháp luật Việt Nam",
        href: "https://luatvietnam.vn/",
      },
      {
        label: "Tìm Nghị định 168/2026/NĐ-CP (Luật Dân số)",
        href: "https://luatvietnam.vn/tim-van-ban.html?keywords=Nghị%20định%20168%2F2026",
      },
      {
        label: "Tìm văn bản lương cơ sở 2026",
        href: "https://luatvietnam.vn/tim-van-ban.html?keywords=lương%20cơ%20sở%202026",
      },
      {
        label: "Chuyên mục Bảo hiểm — tin pháp luật",
        href: "https://luatvietnam.vn/",
      },
    ],
  },
  {
    id: "nghi-dinh",
    heading: "Nghị định hướng dẫn / liên quan (theo mục 2.1 bài viết)",
    links: [
      {
        label: "Nghị định 98/2026/NĐ-CP — xử phạt VPHC bảo trợ xã hội và trẻ em (hiệu lực 16/5/2026)",
        href: "https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Nghi-dinh-98-2026-ND-CP-xu-phat-vi-pham-hanh-chinh-trong-linh-vuc-bao-tro-xa-hoi-va-tre-em-699902.aspx",
      },
      {
        label: "Nghị định 85/2026/NĐ-CP — bảo hiểm hưu trí bổ sung",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-85-2026-ND-CP-bao-hiem-huu-tri-bo-sung-699180.aspx",
      },
      {
        label:
          "Nghị định 274/2025/NĐ-CP — chậm đóng, trốn đóng BHXH bắt buộc, BHTN; khiếu nại, tố cáo",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-274-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-cham-tron-dong-bao-hiem-xa-hoi-653507.aspx",
      },
      {
        label:
          "Nghị định 233/2025/NĐ-CP — cơ chế tài chính BHXH, BHTN, BHYT",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-233-2025-ND-CP-co-che-tai-chinh-ve-bao-hiem-xa-hoi-bao-hiem-that-nghiep-670873.aspx",
      },
      {
        label:
          "Nghị định 212/2025/NĐ-CP — đầu tư từ quỹ BHXH, BHYT, BHTN",
        href: "https://thuvienphapluat.vn/van-ban/Dau-tu/Nghi-dinh-212-2025-ND-CP-huong-dan-hoat-dong-dau-tu-tu-quy-bao-hiem-xa-hoi-bao-hiem-y-te-666742.aspx",
      },
      {
        label:
          "Nghị định 197/2025/NĐ-CP — thành lập, bộ máy giúp việc Hội đồng quản lý BHXH",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-197-2025-ND-CP-thu-tuc-thanh-lap-bo-may-giup-viec-cua-Hoi-dong-quan-ly-bao-hiem-xa-hoi-664283.aspx",
      },
      {
        label: "Nghị định 176/2025/NĐ-CP — trợ cấp hưu trí xã hội",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-176-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-ve-tro-cap-huu-tri-xa-hoi-641047.aspx",
      },
      {
        label:
          "Nghị định 164/2025/NĐ-CP — giao dịch điện tử trong BHXH & CSDL quốc gia",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-164-2025-ND-CP-giao-dich-dien-tu-trong-linh-vuc-bao-hiem-xa-hoi-663153.aspx",
      },
      {
        label:
          "Nghị định 157/2025/NĐ-CP — BHXH bắt buộc đối với quân nhân, CAND, dân quân thường trực…",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-157-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-ve-bao-hiem-xa-hoi-bat-buoc-quan-nhan-662578.aspx",
      },
      {
        label: "Nghị định 158/2025/NĐ-CP — BHXH bắt buộc",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-158-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-ve-bao-hiem-xa-hoi-bat-buoc-634792.aspx",
      },
      {
        label: "Nghị định 159/2025/NĐ-CP — BHXH tự nguyện",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-159-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-ve-bao-hiem-xa-hoi-tu-nguyen-634788.aspx",
      },
    ],
  },
  {
    id: "thong-tu",
    heading: "Thông tư hướng dẫn (theo mục 2.2 bài viết)",
    links: [
      {
        label: "Thông tư 60/2025/TT-BYT — bệnh nghề nghiệp hưởng BHXH",
        href: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Thong-tu-60-2025-TT-BYT-benh-nghe-nghiep-duoc-huong-bao-hiem-xa-hoi-687838.aspx",
      },
      {
        label: "Thông tư 88/2025/TT-BCA — BHXH bắt buộc đối với CAND",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-88-2025-TT-BCA-thuc-hien-bao-hiem-xa-hoi-bat-buoc-doi-voi-si-quan-Cong-an-nhan-dan-675825.aspx",
      },
      {
        label: "Thông tư 12/2025/TT-BNV — BHXH bắt buộc",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-12-2025-TT-BNV-huong-dan-Luat-Bao-hiem-xa-hoi-ve-bao-hiem-xa-hoi-bat-buoc-634791.aspx",
      },
      {
        label: "Thông tư 11/2025/TT-BNV — BHXH tự nguyện",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-11-2025-TT-BNV-huong-dan-Luat-Bao-hiem-xa-hoi-ve-bao-hiem-xa-hoi-tu-nguyen-663712.aspx",
      },
      {
        label:
          "Thông tư 25/2025/TT-BYT — BHXH, AT-VSLĐ (y tế), khám chữa bệnh",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-25-2025-TT-BYT-huong-dan-Luat-bao-hiem-xa-hoi-linh-vuc-y-te-639240.aspx",
      },
    ],
  },
  {
    id: "bai-viet-lien-quan",
    heading: "Bài viết / tiện ích được bài tổng hợp dẫn thêm",
    links: [
      {
        label: "Tỷ lệ đóng BHXH 2026 — chi tiết đối tượng (bài TLPL)",
        href: "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/ty-le-dong-bhxh-2026-cua-tat-ca-cac-doi-tuong-chi-tiet-18586.html",
      },
      {
        label: "14 khoản phụ cấp không đóng BHXH từ 01/7/2025",
        href: "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/14-khoan-phu-cap-khong-dong-bhxh-tu-01-7-2025-14523.html",
      },
      {
        label: "Mẫu TK1-TS / tờ khai tham gia BHXH, BHYT (2026)",
        href: "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/mau-tk1-ts-moi-nhat-2026-mau-to-khai-tham-gia-bhxh-bhyt-18367.html",
      },
      {
        label: "Quyết định 490/QĐ-BHXH năm 2023 (sửa đổi quy trình thu BHXH, BHYT) — TLPL",
        href: "https://thuvienphapluat.vn/van-ban/Bao-hiem/Quyet-dinh-490-QD-BHXH-2023-sua-doi-Quy-trinh-thu-bao-hiem-xa-hoi-bao-hiem-y-te-562047.aspx",
      },
      {
        label: "Trích nộp BHXH, BHYT, BHTN từ 01/7/2025 (công việc pháp lý TLPL)",
        href: "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/cong-viec-phap-ly/trich-nop-tien-bhxh-bhyt-bhtn-tu-01-7-2025-494.html",
      },
    ],
  },
];

export type ThuvienFaqSeed = {
  categorySlug: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  citations: Array<{
    title: string;
    sourceUrl: string;
    legalArticle?: string | null;
    legalClause?: string | null;
  }>;
};

/** FAQ ngắn — import qua `pnpm run faq:import-thuvien` (có chống trùng theo câu hỏi). */
export const THUVIEN_BHXH_FAQ_SEEDS: ThuvienFaqSeed[] = [
  {
    categorySlug: "bhxh",
    question:
      "“Luật Bảo hiểm xã hội mới nhất 2026” mà các bài tổng hợp hay nhắc tới là văn bản nào?",
    shortAnswer:
      "Đó là Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15), đang áp dụng; các bài “2026” thường gom thêm văn bản hợp nhất và NĐ/TT mới.",
    detailedAnswer:
      "Theo cách diễn đạt phổ biến trên Thư viện Pháp Luật, “Luật BHXH mới nhất 2026” không phải một luật mang tên 2026 mà là Luật 2024 cùng hệ văn bản hướng dẫn/hợp nhất cập nhật tới thời điểm tra cứu. Luôn đối chiếu số hiệu, ngày ban hành và Công báo khi áp dụng tại doanh nghiệp.",
    citations: [
      {
        title: THUVIEN_BHXH_20866_SOURCE.title,
        sourceUrl: THUVIEN_BHXH_20866_SOURCE.url,
        legalArticle: "Luật BHXH 2024 (41/2024/QH15) — tham chiếu",
        legalClause: null,
      },
      {
        title: "Luật Bảo hiểm xã hội 2024 — trang văn bản TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhxh",
    question:
      "Trên Thư viện Pháp Luật, tải văn bản hợp nhất Luật Bảo hiểm xã hội (VBHN 19/VBHN-VPQH năm 2026) ở đâu?",
    shortAnswer:
      "Bài tổng hợp 08/05/2026 có liên kết “TẢI VỀ” tới file hợp nhất 19/VBHN-VPQH trên hệ thống TLPL.",
    detailedAnswer:
      "Liên kết tải về là dịch vụ của thuvienphapluat.vn (có thể yêu cầu điều kiện truy cập theo từng thời điểm). Sau khi tải, HR/C&B nên đối chiếu với văn bản gốc/hợp nhất do cơ quan nhà nước công bố.",
    citations: [
      {
        title: "Tải VBHN 19/VBHN-VPQH 2026 (hợp nhất Luật BHXH) — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/documents/download.aspx?id=EsX06W%2byciISGRsIJfEh%2bw%3d%3d&part=-1",
        legalArticle: "19/VBHN-VPQH (tham chiếu theo bài viết TLPL)",
        legalClause: null,
      },
      {
        title: THUVIEN_BHXH_20866_SOURCE.title,
        sourceUrl: THUVIEN_BHXH_20866_SOURCE.url,
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhxh",
    question:
      "Tỷ lệ đóng BHXH — BHYT — BHTN năm 2026 (theo bài tổng hợp TLPL) xem ở đâu và cần lưu ý gì?",
    shortAnswer:
      "TLPL có bài “Tỷ lệ đóng BHXH 2026 của tất cả các đối tượng chi tiết” kèm bảng theo quỹ/chế độ cho NLĐ và NSDLĐ; ví dụ gói minh họa cho NLĐ Việt Nam ghi tổng 32% khi cộng các phần theo bảng. Đối tượng khác (NLĐ nước ngoài, hộ kinh doanh…) có dòng riêng.",
    detailedAnswer:
      "Không sao chép toàn bộ bảng vào đây để tránh sai lệch khi trình bày lại. Hãy mở đúng bài nguồn TLPL và đối chiếu với quyết định mức lương đóng, danh mục phụ cấp không đóng BHXH, và hướng dẫn hiện hành của BHXH/Bộ LĐ-TB&XH tại thời điểm tính lương.",
    citations: [
      {
        title: "Tỷ lệ đóng BHXH 2026 của tất cả các đối tượng chi tiết — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/ty-le-dong-bhxh-2026-cua-tat-ca-cac-doi-tuong-chi-tiet-18586.html",
        legalArticle: null,
        legalClause: null,
      },
      {
        title: THUVIEN_BHXH_20866_SOURCE.title,
        sourceUrl: THUVIEN_BHXH_20866_SOURCE.url,
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhxh",
    question:
      "Theo bài tổng hợp TLPL, “14 khoản phụ cấp không đóng BHXH” được giải thích căn cứ văn bản nào?",
    shortAnswer:
      "Bài “Tỷ lệ đóng BHXH 2026…” dẫn Công văn 1198/CTL&BHXH-BHXH ngày 05/9/2025 và liệt kê 14 khoản phụ cấp ghi riêng trong HĐLĐ không đóng BHXH.",
    detailedAnswer:
      "Danh mục 14 khoản (thưởng chuyên cần theo SXKD, tiền thưởng sáng kiến, tiền ăn giữa ca, hỗ trợ xăng xe/điện thoại/đi lại/nhà ở/giữ trẻ/nuôi con nhỏ, hỗ trợ sự kiện gia đình, trợ cấp khó khăn TNLĐ/BNN…) được trình bày trong bài chi tiết được TLPL liên kết. HR nên đọc đầy đủ công văn và hợp đồng thực tế.",
    citations: [
      {
        title: "Tỷ lệ đóng BHXH 2026 — mục 14 khoản phụ cấp (TLPL)",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/ty-le-dong-bhxh-2026-cua-tat-ca-cac-doi-tuong-chi-tiet-18586.html",
        legalArticle: "CV 1198/CTL&BHXH-BHXH (theo trích dẫn TLPL)",
        legalClause: null,
      },
      {
        title: "14 khoản phụ cấp không đóng BHXH từ 01/7/2025 — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/14-khoan-phu-cap-khong-dong-bhxh-tu-01-7-2025-14523.html",
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
];
