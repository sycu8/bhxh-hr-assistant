export type CuratedFaqCitation = {
  title: string;
  sourceUrl: string;
  legalArticle?: string | null;
  legalClause?: string | null;
};

export type CuratedSourceLabel =
  | "OFFICIAL_LAW"
  | "INTERNAL_POLICY"
  | "REFERENCE_ARTICLE"
  | "HR_APPROVED";

export type CuratedFaq = {
  slug: string;
  categorySlug: string;
  question: string;
  /** Một đoạn trả lời đủ ý, ngắn gọn — không tách phần giải thích dài. */
  answer: string;
  citations: CuratedFaqCitation[];
  /** Từ khóa hỗ trợ khớp câu hỏi tự nhiên. */
  keywords: string[];
  sourceLabel?: CuratedSourceLabel;
  eligibility?: string;
  benefits?: string;
  requiredDocs?: string;
  deadlineNote?: string;
  steps?: string[];
  hrEscalation?: string;
  relatedSlugs?: string[];
};

import { LUATVIETNAM_BAO_HIEM_FAQS } from "@/lib/data/luatvietnam-bao-hiem-faqs";

/** FAQ do HR soạn tay — ưu tiên khi trùng câu hỏi với nguồn crawl. */
const HAND_CURATED_FAQS: CuratedFaq[] = [
  {
    slug: "bat-buoc-tham-gia-bhxh",
    categorySlug: "bhxh",
    question: "Tôi có bắt buộc phải tham gia BHXH, BHYT, BHTN không?",
    answer:
      "Trong quan hệ lao động thuộc phạm vi Luật Lao động, người sử dụng lao động và người lao động phải tham gia BHXH, BHYT, BHTN theo quy định. Các trường hợp miễn hoặc không thuộc đối tượng phải căn cứ luật chuyên ngành và hợp đồng cụ thể.",
    keywords: ["bắt buộc", "tham gia", "bhxh", "bhyt", "bhtn", "đóng"],
    sourceLabel: "OFFICIAL_LAW",
    eligibility:
      "Người lao động làm việc theo hợp đồng lao động thuộc phạm vi Luật Lao động (trừ các trường hợp luật quy định khác).",
    benefits:
      "Được hưởng các chế độ ốm đau, thai sản, tai nạn/LĐNN, hưu trí, tử tuất theo quy định BHXH; khám chữa bệnh BHYT; trợ cấp thất nghiệp nếu đủ điều kiện BHTN.",
    requiredDocs:
      "CMND/CCCD, hợp đồng lao động, sổ BHXH/thẻ BHYT (do HR/C&B và BHXH cấp).",
    deadlineNote:
      "Phải tham gia khi phát sinh quan hệ lao động; HR kê khai trong tháng phát sinh.",
    steps: [
      "Ký hợp đồng lao động với công ty.",
      "HR/C&B kê khai tham gia BHXH, BHYT, BHTN.",
      "Nhận sổ BHXH/thẻ BHYT và đối chiếu mức đóng trên phiếu lương.",
    ],
    hrEscalation:
      "Hỏi HR nếu bạn thuộc diện hợp đồng thử việc, cộng tác viên, lao động nước ngoài, hoặc có thỏa thuận khác trong hợp đồng.",
    relatedSlugs: ["muc-dong-bhxh-bhyt-bhtn", "nghi-khong-luong-14-ngay"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 (41/2024/QH15) — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: "Điều 2",
        legalClause: null,
      },
    ],
  },
  {
    slug: "nghi-khong-luong-14-ngay",
    categorySlug: "bhxh",
    question:
      "Nghỉ không hưởng lương từ 14 ngày làm việc trở lên thì tháng đó có đóng BHXH không?",
    answer:
      "Thông thường, nếu trong tháng người lao động không hưởng tiền lương từ 14 ngày làm việc trở lên thì không phải đóng BHXH tháng đó, trừ các ngoại lệ theo văn bản hướng dẫn. Trường hợp nghỉ ốm, thai sản, tháng đầu vào làm hoặc quay lại làm cần HR/C&B đối chiếu hồ sơ.",
    keywords: ["nghỉ không lương", "14 ngày", "đóng bhxh", "tháng"],
    citations: [
      {
        title: "Xác định đóng BHXH theo số ngày không hưởng lương — Chính sách online",
        sourceUrl:
          "http://www.chinhsachonline.chinhphu.vn/xac-dinh-dong-bhxh-can-cu-so-ngay-khong-huong-luong-trong-thang-84744.htm",
      },
    ],
  },
  {
    slug: "muc-dong-bhxh-bhyt-bhtn",
    categorySlug: "bhxh",
    question: "BHXH, BHYT, BHTN được tính trên khoản lương nào?",
    answer:
      "Mức đóng BHXH, BHYT, BHTN tính trên tiền lương làm căn cứ đóng bảo hiểm (gồm lương, phụ cấp và các khoản bổ sung theo quy định, trừ các khoản không đóng). Tỷ lệ đóng của người lao động và người sử dụng lao động do Chính phủ quy định theo từng thời kỳ.",
    keywords: ["mức đóng", "lương", "căn cứ", "tỷ lệ", "phụ cấp"],
    citations: [
      {
        title: "Tỷ lệ đóng BHXH 2026 theo đối tượng — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/ty-le-dong-bhxh-2026-cua-tat-ca-cac-doi-tuong-chi-tiet-18586.html",
      },
    ],
  },
  {
    slug: "the-bhyt-dung-de-lam-gi",
    categorySlug: "bhyt",
    question: "Thẻ BHYT dùng để làm gì và khi đi khám cần lưu ý gì?",
    answer:
      "Thẻ BHYT dùng để được quỹ BHYT chi trả phần chi phí khám chữa bệnh theo mức hưởng và đúng quy định tuyến, nơi đăng ký khám ban đầu. Khi khám cần mang thẻ BHYT và giấy tờ tùy thân; chuyển tuyến phải đúng quy trình.",
    keywords: ["thẻ bhyt", "khám", "tuyến", "đăng ký"],
    citations: [
      {
        title: "Lĩnh vực Bảo hiểm Y tế — BHXH Việt Nam",
        sourceUrl:
          "https://baohiemxahoi.gov.vn/tintuc/Pages/linh-vuc-bao-hiem-y-te.aspx?CateID=169&ItemID=25518",
      },
    ],
  },
  {
    slug: "dieu-kien-tro-cap-that-nghiep",
    categorySlug: "bhtn",
    question: "Điều kiện để hưởng trợ cấp thất nghiệp (BHTN) là gì?",
    answer:
      "Cần chấm dứt hợp đồng lao động đúng quy định, đã đóng BHTN đủ thời gian tối thiểu (thường 12 tháng trong 24 tháng trước khi nghỉ) và nộp hồ sơ tại trung tâm dịch vụ việc làm trong thời hạn luật định (thường 3 tháng kể từ ngày chấm dứt HĐLĐ).",
    keywords: ["bhtn", "thất nghiệp", "trợ cấp", "điều kiện", "nghỉ việc"],
    citations: [
      {
        title: "VBHN Luật Việc làm — hướng dẫn BHTN (Công báo)",
        sourceUrl:
          "https://congbao.chinhphu.vn/tai-ve-van-ban-so-3305-vbhn-bldtbxh-42445-51195?format=pdf",
        legalArticle: "Điều 52 Luật Việc làm",
      },
    ],
  },
  {
    slug: "quy-trinh-thu-bhxh-595",
    categorySlug: "bhxh",
    question: "Quyết định 595/QĐ-BHXH liên quan gì đến thu BHXH/BHYT/BHTN?",
    answer:
      "Quyết định 595/QĐ-BHXH ban hành quy trình thu BHXH, BHYT, BHTN và quản lý sổ BHXH, thẻ BHYT. Đây là căn cứ nghiệp vụ khi thực hiện kê khai, điều chỉnh thông tin hoặc chốt sổ.",
    keywords: ["595", "quy trình", "thu", "sổ", "thẻ"],
    citations: [
      {
        title: "Quyết định 595/QĐ-BHXH — Quy trình thu BHXH, BHYT, BHTN",
        sourceUrl: "https://tthc.hue.gov.vn/Content/Vanban/chitiet?iVanBan=3536",
      },
    ],
  },
  {
    slug: "che-do-thai-san-tom-tat",
    categorySlug: "thai-san",
    question: "Nghỉ thai sản được hưởng chế độ như thế nào?",
    answer:
      "Theo Luật Dân số 2025 (hiệu lực 01/7/2026): lao động nữ nghỉ 7 tháng, nam nghỉ 10 ngày làm việc khi vợ sinh. Trợ cấp thai sản từ BHXH nếu đủ điều kiện đóng. CBNV FPT Telecom còn được hưởng thêm chính sách hỗ trợ sinh con và trợ cấp bổ sung Công ty (1069/QĐ-FTEL) — xem trang Chế độ thai sản.",
    keywords: ["thai sản", "nghỉ sinh", "trợ cấp", "sinh con", "7 tháng"],
    citations: [
      {
        title: "Luật Dân số 2025 (113/2025/QH15)",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Van-hoa-Xa-hoi/Luat-dan-so-2025-so-113-2025-QH15-443680.aspx",
      },
      {
        title: "Chế độ thai sản — công cụ FPT Telecom",
        sourceUrl: "/calculators/che-do-thai-san",
      },
    ],
  },
  {
    slug: "ftel-ho-tro-thai-san-level-2025",
    categorySlug: "thai-san",
    question: "FPT hỗ trợ thai sản bao nhiêu theo Level năm 2025?",
    answer:
      "Chính sách hỗ trợ thai sản FPT (chi một lần khi sinh, 2025): Level 2 — 5 triệu; Level 3 — 15 triệu; Level 4 — 40 triệu đồng. Chi kỳ lương gần nhất sau khi nộp giấy chứng sinh/khai sinh; thu nhập chịu thuế TNCN. Cộng thêm BHXH và chế độ FTEL.",
    keywords: ["fpt", "ftel", "level", "hỗ trợ thai sản", "5 triệu", "15 triệu", "40 triệu"],
    citations: [
      {
        title: "Chính sách hỗ trợ thai sản FPT 2025",
        sourceUrl: "/legal-updates/ftel-ho-tro-thai-san-level-2025",
      },
    ],
  },
  {
    slug: "luong-co-so-2-53-2026",
    categorySlug: "bhxh",
    question: "Lương cơ sở từ 01/7/2026 là bao nhiêu và trần đóng BHXH?",
    answer:
      "Từ 01/7/2026 mức lương cơ sở tăng lên 2,53 triệu đồng/tháng. Mức lương làm căn cứ đóng BHXH bắt buộc cao nhất = 20 lần mức tham chiếu = 50,6 triệu đồng/tháng (khoản 13 Điều 141 Luật BHXH). HR cần cập nhật kê khai từ ngày hiệu lực.",
    keywords: ["lương cơ sở", "2,53", "50,6", "trần", "bhxh", "2026"],
    citations: [
      {
        title: "Tăng lương cơ sở 01/7/2026",
        sourceUrl: "/legal-updates/tang-luong-co-so-2-53-trieu-2026",
      },
      {
        title: "Cập nhật lương cơ bản — công cụ",
        sourceUrl: "/calculators/luong-co-ban",
      },
    ],
  },
  {
    slug: "nghi-dinh-168-thai-san-con-hai",
    categorySlug: "thai-san",
    question: "Sinh con thứ hai được nghỉ thai sản khi nào (Nghị định 168)?",
    answer:
      "Từ 01/7/2026 (Nghị định 168/2026): lao động nữ khi sinh con mà tại thời điểm sinh có một con đẻ còn sống; lao động nam khi vợ sinh và vợ có một con đẻ còn sống. Không áp dụng sảy thai/phá thai/thai chết từ đủ 22 tuần. Thủ tục hưởng theo quy định BHXH.",
    keywords: ["con thứ hai", "nghị định 168", "luật dân số", "sinh con hai"],
    citations: [
      {
        title: "Nghị định 168/2026/NĐ-CP",
        sourceUrl: "/legal-updates/nghi-dinh-168-2026-nd-cp-luat-dan-so",
      },
    ],
  },
  {
    slug: "sang-loc-thai-nghen-2027",
    categorySlug: "thai-san",
    question: "Hỗ trợ sàng lọc thai nghén từ 2027 là gì?",
    answer:
      "Từ 01/01/2027 phụ nữ mang thai được hỗ trợ gói sàng lọc Down, Edwards, Patau, Thalassemia — tối đa 900.000 đồng/trường hợp. Trẻ sơ sinh cũng được hưởng hỗ trợ gói dịch vụ sàng lọc theo quy định.",
    keywords: ["sàng lọc", "down", "thalassemia", "900.000", "2027"],
    citations: [
      {
        title: "Nghị định 168/2026 — hỗ trợ sàng lọc",
        sourceUrl: "/legal-updates/nghi-dinh-168-2026-nd-cp-luat-dan-so",
      },
    ],
  },
  {
    slug: "nghi-om-benh",
    categorySlug: "om-dau",
    question: "Nghỉ ốm có được hưởng BHXH không?",
    answer:
      "Người lao động nghỉ việc hưởng chế độ ốm đau do bệnh thông thường có thể được hưởng trợ cấp từ quỹ BHXH nếu đủ điều kiện đóng và có giấy chứng nhận nghỉ việc hưởng BHXH hợp lệ. Mức hưởng phụ thuộc thời gian đóng và quy định hiện hành.",
    keywords: ["ốm", "nghỉ bệnh", "chứng nhận", "trợ cấp"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 — ốm đau",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: "Điều 27",
      },
    ],
  },
  {
    slug: "nghi-viec-chot-bhxh",
    categorySlug: "nghi-viec",
    question: "Khi nghỉ việc, quyền lợi BHXH cần làm gì?",
    answer:
      "Khi chấm dứt HĐLĐ, cần chốt sổ BHXH, xác nhận thời gian đóng, kiểm tra quyền lợi một lần (nếu đủ điều kiện) hoặc bảo lưu để hưởng sau. Đồng thời xử lý thẻ BHYT và hồ sơ BHTN nếu có nhu cầu hưởng trợ cấp thất nghiệp.",
    keywords: ["nghỉ việc", "chốt sổ", "một lần", "bảo lưu"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 — quyền lợi khi chấm dứt",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
      },
    ],
  },
  {
    slug: "luat-bhxh-2024-2026",
    categorySlug: "bhxh",
    question: "Luật BHXH “mới nhất 2026” mà hay nghe là văn bản nào?",
    answer:
      "Đó là Luật Bảo hiểm xã hội 2024 (41/2024/QH15) đang áp dụng; các bài “2026” thường gom thêm văn bản hợp nhất và NĐ/TT mới. Luôn đối chiếu số hiệu, ngày ban hành và Công báo trước khi áp dụng.",
    keywords: ["luật 2024", "2026", "mới nhất", "vbhn"],
    citations: [
      {
        title: "Luật BHXH 2024 — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
      },
      {
        title: "Tổng hợp Luật BHXH 2026 — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/luat-bao-hiem-xa-hoi-moi-nhat-2026-va-tong-hop-van-ban-huong-dan-20866.html",
      },
    ],
  },
  {
    slug: "phu-cap-khong-dong-bhxh",
    categorySlug: "bhxh",
    question: "Phụ cấp nào không tính vào mức đóng BHXH?",
    answer:
      "Một số khoản phụ cấp, trợ cấp ghi riêng trong HĐLĐ có thể không đóng BHXH theo danh mục hướng dẫn (ví dụ hỗ trợ xăng xe, điện thoại, ăn giữa ca… theo từng công văn). HR cần đối chiếu danh mục hiện hành và hợp đồng thực tế.",
    keywords: ["phụ cấp", "không đóng", "14 khoản"],
    citations: [
      {
        title: "14 khoản phụ cấp không đóng BHXH — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/14-khoan-phu-cap-khong-dong-bhxh-tu-01-7-2025-14523.html",
      },
    ],
  },
  {
    slug: "huu-tri-dieu-kien",
    categorySlug: "huu-tri",
    question: "Điều kiện hưởng lương hưu là gì?",
    answer:
      "Được hưởng lương hưu khi đủ tuổi nghỉ hưu và đủ thời gian đóng BHXH theo quy định (hoặc các trường hợp nghỉ hưu trước tuổi theo luật). Mức lương hưu căn cứ thời gian đóng, mức lương đóng và quy tắc tính tại thời điểm nghỉ hưu.",
    keywords: ["hưu trí", "lương hưu", "tuổi nghỉ"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 — lương hưu",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: "Chương III",
      },
    ],
  },
  {
    slug: "tai-nan-lao-dong-bhxh",
    categorySlug: "tai-nan",
    question: "Tai nạn lao động được BHXH chi trả những gì?",
    answer:
      "Người lao động bị tai nạn lao động, bệnh nghề nghiệp có thể được hưởng các chế độ từ quỹ BHXH như chi phí y tế, trợ cấp, phục hồi chức năng… tùy mức độ và hồ sơ giám định. Doanh nghiệp vẫn có trách nhiệm theo luật lao động và bảo hiểm TNLĐ-BNN.",
    keywords: ["tai nạn", "tnld", "bệnh nghề nghiệp"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 — TNLĐ, BNN",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: "Chương V",
      },
    ],
  },
  {
    slug: "tu-tang-tro-cap",
    categorySlug: "tu-tang",
    question: "Người thân được hưởng trợ cấp tử tuất khi nào?",
    answer:
      "Khi người lao động đang tham gia BHXH hoặc đã đóng đủ thời gian mà tử vong, người thân đủ điều kiện có thể được hưởng mai táng phí, trợ cấp tử tuất hàng tháng hoặc trợ cấp một lần theo quy định. Cần nộp hồ sơ đúng thẩm quyền.",
    keywords: ["tử tuất", "mai táng", "người thân", "tử vong"],
    citations: [
      {
        title: "Luật Bảo hiểm xã hội 2024 — tử tuất",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
        legalArticle: "Chương VI",
      },
    ],
  },
  {
    slug: "nguoi-phu-thuoc-giam-tru",
    categorySlug: "nguoi-phu-thuoc",
    question: "Người phụ thuộc có liên quan gì đến BHXH?",
    answer:
      "Đăng ký người phụ thuộc chủ yếu phục vụ giảm trừ gia cảnh thuế TNCN, không phải đối tượng tham gia BHXH bắt buộc. Tuy nhiên một số chế độ BHXH (ví dụ con nhỏ của lao động nữ) có quy định riêng — cần đối chiếu từng trường hợp.",
    keywords: ["phụ thuộc", "giảm trừ", "gia cảnh"],
    citations: [
      {
        title: "Luật Thuế TNCN — giảm trừ gia cảnh (tham chiếu)",
        sourceUrl: "https://thuvienphapluat.vn/van-ban/Thue/",
      },
    ],
  },
  {
    slug: "qd-366-quy-trinh-thu-2026",
    categorySlug: "bhxh",
    question: "Quyết định 366/QĐ-BHXH (2026) là gì?",
    answer:
      "366/QĐ-BHXH ban hành Quy trình thu BHXH, BHYT, BHTN; cấp sổ BHXH và thẻ BHYT theo quy định mới. HR/C&B dùng làm căn cứ khi triển khai kê khai và cập nhật nghiệp vụ thu tại doanh nghiệp.",
    keywords: ["366", "quy trình thu", "2026"],
    citations: [
      {
        title: "366/QĐ-BHXH — PDF nội bộ FPT Telecom",
        sourceUrl: "/docs/366-QD-BHXH-2026.pdf",
      },
    ],
  },
];

function mergeCuratedFaqs(hand: CuratedFaq[], imported: CuratedFaq[]): CuratedFaq[] {
  const seen = new Set<string>();
  const merged: CuratedFaq[] = [];
  for (const faq of [...hand, ...imported]) {
    const key = faq.question.toLocaleLowerCase("vi-VN").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(faq);
  }
  return merged;
}

/** FAQ hiển thị tại /hoi-dap — gồm bản HR soạn + LuatVietnam Bảo hiểm (114 câu). */
export const CURATED_FAQS: CuratedFaq[] = mergeCuratedFaqs(
  HAND_CURATED_FAQS,
  LUATVIETNAM_BAO_HIEM_FAQS,
);

const bySlug = new Map(CURATED_FAQS.map((f) => [f.slug, f]));

export function getCuratedFaqBySlug(slug: string): CuratedFaq | undefined {
  return bySlug.get(slug);
}

export function listCuratedFaqs(categorySlug?: string): CuratedFaq[] {
  if (!categorySlug) return CURATED_FAQS;
  return CURATED_FAQS.filter((f) => f.categorySlug === categorySlug);
}
