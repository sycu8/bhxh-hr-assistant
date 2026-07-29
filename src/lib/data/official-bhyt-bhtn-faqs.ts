/**
 * FAQ BHYT/BHTN trích từ nguồn chính thống đã có trong hệ thống:
 * BHXH Việt Nam, Thư viện Pháp Luật, VBPL, Công báo — không sao chép toàn văn.
 */
import type { CuratedFaq } from "@/lib/data/curated-faqs";

const BHXH_BHYT_PORTAL =
  "https://baohiemxahoi.gov.vn/tintuc/Pages/linh-vuc-bao-hiem-y-te.aspx?CateID=169&ItemID=25518";
const LUAT_BHYT_TLPL =
  "https://thuvienphapluat.vn/van-ban/Y-te-Lao-dong-Tien-luong/Luat-Bao-hiem-y-te-2008-so-14-2008-QH12-497.aspx";
const ND_146_2018_TLPL =
  "https://thuvienphapluat.vn/van-ban/Y-te-Lao-dong-Tien-luong/Nghi-dinh-146-2018-ND-CP-quy-dinh-chi-tiet-thi-hanh-mot-so-dieu-Luat-bao-hiem-y-te-359682.aspx";
const LUAT_VIEC_LAM_TLPL =
  "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Luat-Viec-lam-2013-38-2013-QH13-183193.aspx";
const ND_28_2015_BHTN_TLPL =
  "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-28-2015-ND-CP-huong-dan-Luat-Viec-lam-ve-bao-hiem-that-nghiep-282417.aspx";
const ND_274_2025_TLPL =
  "https://thuvienphapluat.vn/van-ban/Bao-hiem/Nghi-dinh-274-2025-ND-CP-huong-dan-Luat-Bao-hiem-xa-hoi-cham-tron-dong-bao-hiem-xa-hoi-653507.aspx";
const TY_LE_DONG_2026_TLPL =
  "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/ty-le-dong-bhxh-2026-cua-tat-ca-cac-doi-tuong-chi-tiet-18586.html";
const MOLISA =
  "https://molisa.gov.vn";

export const OFFICIAL_BHYT_BHTN_FAQS: CuratedFaq[] = [
  {
    slug: "official-bhyt-ty-le-dong-2026",
    categorySlug: "bhyt",
    question: "Tỷ lệ đóng BHYT của người lao động và doanh nghiệp năm 2026 là bao nhiêu?",
    answer:
      "Theo các bảng tổng hợp tỷ lệ đóng hiện hành, người lao động đóng 1,5% và người sử dụng lao động đóng 3% trên tiền lương làm căn cứ đóng BHYT (trong gói BHXH/BHYT/BHTN). Mức cụ thể phải đối chiếu văn bản hướng dẫn tại thời điểm trích nộp.",
    keywords: ["tỷ lệ", "đóng", "bhyt", "1.5%", "3%", "2026"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Tỷ lệ đóng BHXH 2026 — TLPL", sourceUrl: TY_LE_DONG_2026_TLPL },
      { title: "Luật Bảo hiểm y tế 2008 — TLPL", sourceUrl: LUAT_BHYT_TLPL },
    ],
  },
  {
    slug: "official-bhyt-the-dien-tu-2025",
    categorySlug: "bhyt",
    question: "Từ khi nào dừng cấp thẻ BHYT giấy và dùng thẻ điện tử?",
    answer:
      "Theo hướng dẫn của BHXH Việt Nam (Công văn 168/BHXH-QLT năm 2025), từ 01/6/2025 các trường hợp cấp lại, cấp đổi thẻ BHYT chuyển sang thẻ điện tử/ứng dụng VssID thay cho phôi thẻ giấy. Khi khám vẫn cần xuất trình thẻ điện tử hoặc mã QR hợp lệ cùng giấy tờ tùy thân.",
    keywords: ["thẻ điện tử", "vssid", "01/6/2025", "cấp đổi"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Lĩnh vực BHYT — BHXH Việt Nam", sourceUrl: BHXH_BHYT_PORTAL },
      { title: "Luật BHYT — TLPL", sourceUrl: LUAT_BHYT_TLPL },
    ],
  },
  {
    slug: "official-bhyt-noi-dk-kcb-ban-dau",
    categorySlug: "bhyt",
    question: "Nơi đăng ký khám chữa bệnh ban đầu (KCB ban đầu) là gì?",
    answer:
      "Người tham gia BHYT phải đăng ký nơi KCB ban đầu (thường là cơ sở y tế tuyến phù hợp gần nơi cư trú hoặc làm việc). Khi khám đúng nơi đăng ký được hưởng mức chi trả cao hơn; khám trái tuyến/trái nơi đăng ký bị giảm mức hưởng trừ trường hợp cấp cứu hoặc có giấy chuyển tuyến hợp lệ.",
    keywords: ["đăng ký", "kcb ban đầu", "nơi khám", "tuyến"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Nghị định 146/2018/NĐ-CP — KCB BHYT",
        sourceUrl: ND_146_2018_TLPL,
        legalArticle: "Điều 14–16",
      },
      { title: "Lĩnh vực BHYT — BHXH Việt Nam", sourceUrl: BHXH_BHYT_PORTAL },
    ],
  },
  {
    slug: "official-bhyt-muc-huong-theo-nhom",
    categorySlug: "bhyt",
    question: "Mức hưởng BHYT khi đi khám phụ thuộc vào điều gì?",
    answer:
      "Mức chi trả của quỹ BHYT phụ thuộc nhóm đối tượng (ví dụ người lao động, hưu trí, người nghèo…), nơi KCB (đúng tuyến/đúng nơi đăng ký hay không), loại dịch vụ trong danh mục được chi trả và thời gian tham gia BHYT liên tục. Nghị định 146/2018 quy định chi tiết mức đồng chi trả và các trường hợp 100% hoặc 80% chi phí.",
    keywords: ["mức hưởng", "đồng chi trả", "80%", "100%", "nhóm đối tượng"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Nghị định 146/2018/NĐ-CP",
        sourceUrl: ND_146_2018_TLPL,
        legalArticle: "Điều 22–23",
      },
    ],
  },
  {
    slug: "official-bhyt-chuyen-tuyen",
    categorySlug: "bhyt",
    question: "Khi nào cần giấy chuyển tuyến BHYT và tái khám có cần không?",
    answer:
      "Chuyển tuyến khám chữa bệnh BHYT phải có hồ sơ chuyển tuyến và giấy chuyển tuyến theo mẫu (Nghị định 146/2018). Tái khám theo hẹn của cơ sở tuyến trên thường không cần chuyển tuyến mới nếu còn trong đợt điều trị; trường hợp cụ thể do bác sĩ và cơ sở KCB xác định.",
    keywords: ["chuyển tuyến", "tái khám", "giấy chuyển tuyến"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Nghị định 146/2018/NĐ-CP",
        sourceUrl: ND_146_2018_TLPL,
        legalArticle: "Điều 15",
      },
    ],
  },
  {
    slug: "official-bhyt-thoi-gian-lien-tuc",
    categorySlug: "bhyt",
    question: "Tham gia BHYT bao lâu thì được hưởng 100% chi phí khám chữa bệnh?",
    answer:
      "Người lao động tham gia BHYT đủ 12 tháng liên tục trở lên (trong các trường hợp quy định) được hưởng mức chi trả cao hơn so với tham gia chưa đủ thời gian. Nếu gián đoạn đóng, thời gian liên tục tính lại theo quy định tại Luật BHYT và Nghị định 146/2018 — HR/C&B nên đối chiếu lịch sử đóng trên sổ/thẻ.",
    keywords: ["12 tháng", "liên tục", "100%", "gián đoạn"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Luật BHYT — TLPL", sourceUrl: LUAT_BHYT_TLPL, legalArticle: "Điều 30" },
      { title: "Nghị định 146/2018/NĐ-CP", sourceUrl: ND_146_2018_TLPL },
    ],
  },
  {
    slug: "official-bhyt-nghi-viec-con-huong",
    categorySlug: "bhyt",
    question: "Nghỉ việc rồi thẻ BHYT còn dùng được không?",
    answer:
      "Thẻ BHYT ghi thời hạn sử dụng đến ngày cụ thể. Trong thời hạn còn hiệu lực, người tham gia vẫn được quyền KCB theo BHYT dù đã chấm dứt HĐLĐ, trừ khi thẻ hết hạn hoặc bị thu hồi theo quy định. Sau khi nghỉ việc, nếu không tiếp tục đóng (tự nguyện/hộ gia đình), thẻ sẽ không được gia hạn.",
    keywords: ["nghỉ việc", "hết hạn", "thẻ còn hiệu lực"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Luật BHYT — TLPL", sourceUrl: LUAT_BHYT_TLPL },
      { title: "Lĩnh vực BHYT — BHXH Việt Nam", sourceUrl: BHXH_BHYT_PORTAL },
    ],
  },
  {
    slug: "official-bhyt-ho-gia-dinh",
    categorySlug: "bhyt",
    question: "Mua BHYT theo hộ gia đình là gì và ai được tham gia?",
    answer:
      "Nhóm tham gia BHYT theo hộ gia đình gồm các thành viên cùng hộ (theo đăng ký thường trú/tạm trú) không thuộc các nhóm đã được Nhà nước đóng hoặc đóng bắt buộc khác. Mức đóng và mức hưởng theo Luật BHYT; thủ tục đăng ký tại cơ quan BHXH hoặc điểm thu.",
    keywords: ["hộ gia đình", "mua bhyt", "thành viên"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Luật BHYT — TLPL", sourceUrl: LUAT_BHYT_TLPL, legalArticle: "Điều 12" },
    ],
  },
  {
    slug: "official-bhyt-cap-lai-doi-the",
    categorySlug: "bhyt",
    question: "Làm thủ tục cấp lại hoặc đổi thẻ BHYT khi mất/hỏng thế nào?",
    answer:
      "Người lao động (hoặc HR thay mặt) nộp hồ sơ đề nghị cấp lại/đổi thẻ tại cơ quan BHXH theo quy trình thu BHXH/BHYT (595/QĐ-BHXH, 366/QĐ-BHXH). Từ 01/6/2025 cấp đổi chuyển sang thẻ điện tử; cần cập nhật thông tin cá nhân chính xác trên VssID.",
    keywords: ["cấp lại", "đổi thẻ", "mất thẻ", "hỏng thẻ"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Lĩnh vực BHYT — BHXH Việt Nam", sourceUrl: BHXH_BHYT_PORTAL },
      {
        title: "Mẫu TK1-TS tham gia BHXH, BHYT 2026 — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/mau-tk1-ts-moi-nhat-2026-mau-to-khai-tham-gia-bhxh-bhyt-18367.html",
      },
    ],
  },
  {
    slug: "official-bhyt-nghi-khong-luong",
    categorySlug: "bhyt",
    question: "Tháng nghỉ không lương từ 14 ngày có phải đóng BHYT không?",
    answer:
      "Khi người lao động không hưởng lương từ 14 ngày làm việc trở lên trong tháng, thông thường không phải đóng BHXH/BHYT/BHTN tháng đó (trừ ngoại lệ theo văn bản hướng dẫn). Nghỉ ốm, thai sản hoặc các chế độ hưởng lương/chế độ BHXH khác có quy tắc riêng — cần HR đối chiếu.",
    keywords: ["nghỉ không lương", "14 ngày", "đóng bhyt"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật BHXH 2024 — TLPL",
        sourceUrl:
          "https://thuvienphapluat.vn/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx",
      },
      { title: "Tỷ lệ đóng BHXH 2026 — TLPL", sourceUrl: TY_LE_DONG_2026_TLPL },
    ],
  },
  {
    slug: "official-bhtn-ty-le-dong",
    categorySlug: "bhtn",
    question: "Tỷ lệ đóng BHTN của người lao động và doanh nghiệp là bao nhiêu?",
    answer:
      "Theo bảng tỷ lệ đóng hiện hành, người lao động đóng 1% và người sử dụng lao động đóng 1% trên tiền lương làm căn cứ đóng BHTN. Mức đóng gộp với BHXH/BHYT trên cùng căn cứ lương do HR kê khai hàng tháng.",
    keywords: ["tỷ lệ", "đóng", "bhtn", "1%"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      { title: "Tỷ lệ đóng BHXH 2026 — TLPL", sourceUrl: TY_LE_DONG_2026_TLPL },
      { title: "Luật Việc làm — TLPL", sourceUrl: LUAT_VIEC_LAM_TLPL },
    ],
  },
  {
    slug: "official-bhtn-dieu-kien-huong",
    categorySlug: "bhtn",
    question: "Điều kiện hưởng trợ cấp thất nghiệp theo Luật Việc làm?",
    answer:
      "Cần: (1) chấm dứt hợp đồng lao động/trái với hợp đồng xác định thời hạn; (2) đã đóng BHTN từ đủ 12 tháng trở lên trong 24 tháng trước khi chấm dứt; (3) đã nộp hồ sơ hưởng trợ cấp tại trung tâm dịch vụ việc làm trong 03 tháng kể từ ngày chấm dứt; (4) chưa có lương hưu hoặc trợ cấp mất việc làm.",
    keywords: ["điều kiện", "12 tháng", "24 tháng", "3 tháng", "hồ sơ"],
    sourceLabel: "OFFICIAL_LAW",
    eligibility:
      "Đóng BHTN ≥12 tháng trong 24 tháng trước nghỉ; nộp hồ sơ trong 3 tháng.",
    citations: [
      {
        title: "Luật Việc làm 2013 — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 52",
      },
      {
        title: "Nghị định 28/2015/NĐ-CP — BHTN",
        sourceUrl: ND_28_2015_BHTN_TLPL,
      },
    ],
  },
  {
    slug: "official-bhtn-muc-tro-cap",
    categorySlug: "bhtn",
    question: "Mức trợ cấp thất nghiệp tính như thế nào?",
    answer:
      "Mức trợ cấp thất nghiệp hàng tháng bằng 60% mức bình quân tiền lương tháng đóng BHTN của 06 tháng liền kề trước khi thất nghiệp, nhưng không vượt trần do Chính phủ quy định. Thời gian hưởng phụ thuộc số tháng đã đóng BHTN (tối đa 12 tháng với đủ 12–36 tháng đóng, có thể lên 18 tháng nếu đóng trên 36 tháng).",
    keywords: ["mức trợ cấp", "60%", "bình quân", "6 tháng"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật Việc làm — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 53",
      },
      { title: "Nghị định 28/2015/NĐ-CP", sourceUrl: ND_28_2015_BHTN_TLPL },
    ],
  },
  {
    slug: "official-bhtn-ho-so",
    categorySlug: "bhtn",
    question: "Hồ sơ hưởng trợ cấp thất nghiệp gồm những gì?",
    answer:
      "Hồ sơ gồm: đơn đề nghị; bản sao HĐLĐ/chứng nhận chấm dứt HĐLĐ; sổ BHXH hoặc xác nhận thời gian đóng BHTN; CMND/CCCD; và giấy tờ khác theo hướng dẫn của Sở LĐ-TB&XH. Nộp tại trung tâm dịch vụ việc làm nơi cư trú.",
    keywords: ["hồ sơ", "đơn", "sổ bhxh", "chấm dứt hđlđ"],
    sourceLabel: "OFFICIAL_LAW",
    requiredDocs: "Đơn, HĐLĐ/chứng nhận nghỉ, sổ BHXH, CCCD.",
    citations: [
      { title: "Nghị định 28/2015/NĐ-CP", sourceUrl: ND_28_2015_BHTN_TLPL },
      { title: "Bộ LĐ-TB&XH", sourceUrl: MOLISA },
    ],
  },
  {
    slug: "official-bhtn-khong-duoc-huong",
    categorySlug: "bhtn",
    question: "Trường hợp nào không được hưởng trợ cấp thất nghiệp?",
    answer:
      "Không hưởng khi: tự ý nghỉ việc không đúng luật; đang hưởng lương hưu; nhận trợ cấp mất việc làm từ quỹ khác; có lương từ HĐLĐ mới; từ chối việc làm phù hợp do trung tâm việc làm giới thiệu (sau lần thứ hai); không đến báo cáo định kỳ theo quy định.",
    keywords: ["không được hưởng", "tự nghỉ", "từ chối việc"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật Việc làm — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 52, 54",
      },
    ],
  },
  {
    slug: "official-bhtn-hoc-nghe",
    categorySlug: "bhtn",
    question: "Trợ cấp thất nghiệp có được đi học nghề không?",
    answer:
      "Trong thời gian hưởng trợ cấp, người lao động có thể đăng ký học nghề ngắn hạn; được hỗ trợ học phí và hưởng trợ cấp thất nghiệp theo quy định tại Luật Việc làm và Nghị định 28/2015. Cần đăng ký học nghề tại cơ sở được cơ quan có thẩm quyền công nhận.",
    keywords: ["học nghề", "học phí", "đào tạo"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật Việc làm — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 55",
      },
      { title: "Nghị định 28/2015/NĐ-CP", sourceUrl: ND_28_2015_BHTN_TLPL },
    ],
  },
  {
    slug: "official-bhtn-cham-dong",
    categorySlug: "bhtn",
    question: "Doanh nghiệp chậm đóng BHTN bị xử lý thế nào?",
    answer:
      "Nghị định 274/2025/NĐ-CP (hướng dẫn Luật BHXH) quy định xử lý chậm đóng, trốn đóng BHXH bắt buộc và BHTN, khiếu nại và trách nhiệm của người sử dụng lao động. HR/C&B cần trích nộp đúng hạn để NLĐ không bị gián đoạn quyền lợi khi nghỉ việc.",
    keywords: ["chậm đóng", "trốn đóng", "phạt", "274/2025"],
    sourceLabel: "OFFICIAL_LAW",
    hrEscalation: "Liên hệ phòng C&B nếu phát hiện thiếu tháng đóng BHTN trên sổ.",
    citations: [
      { title: "Nghị định 274/2025/NĐ-CP — TLPL", sourceUrl: ND_274_2025_TLPL },
    ],
  },
  {
    slug: "official-bhtn-sa-thai-tu-nghi",
    categorySlug: "bhtn",
    question: "Bị sa thải và tự nghỉ việc có cùng quyền lợi BHTN không?",
    answer:
      "Trợ cấp thất nghiệp chỉ áp dụng khi chấm dứt HĐLĐ thuộc các trường hợp luật cho phép (ví dụ hết hạn HĐLĐ, thỏa thuận, sa thải trái pháp luật được công nhận…). Tự ý bỏ việc không đúng quy trình thường không đủ điều kiện. Cần đọc kỹ lý do chấm dứt trên quyết định/thỏa thuận.",
    keywords: ["sa thải", "tự nghỉ", "chấm dứt hđlđ"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật Việc làm — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 52",
      },
      { title: "Bộ LĐ-TB&XH", sourceUrl: MOLISA },
    ],
  },
  {
    slug: "official-bhtn-bao-cao-dinh-ky",
    categorySlug: "bhtn",
    question: "Trong thời gian hưởng trợ cấp thất nghiệp phải làm gì định kỳ?",
    answer:
      "Người lao động phải đến trung tâm dịch vụ việc làm báo cáo việc tìm việc làm theo lịch (thường 3 tháng/lần). Không báo cáo đúng hạn có thể bị tạm dừng hoặc chấm dứt hưởng trợ cấp theo Luật Việc làm.",
    keywords: ["báo cáo", "tìm việc", "3 tháng", "trung tâm việc làm"],
    sourceLabel: "OFFICIAL_LAW",
    citations: [
      {
        title: "Luật Việc làm — TLPL",
        sourceUrl: LUAT_VIEC_LAM_TLPL,
        legalArticle: "Điều 54",
      },
    ],
  },
];

export function countOfficialBhytBhtnFaqs() {
  const bhyt = OFFICIAL_BHYT_BHTN_FAQS.filter((f) => f.categorySlug === "bhyt").length;
  const bhtn = OFFICIAL_BHYT_BHTN_FAQS.filter((f) => f.categorySlug === "bhtn").length;
  return { bhyt, bhtn, total: OFFICIAL_BHYT_BHTN_FAQS.length };
}
