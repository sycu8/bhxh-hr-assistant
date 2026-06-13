/** Chủ đề BHXH/BHYT/BHTN và chế độ liên quan — dùng cho crawl và lọc kho văn bản. */
export const INSURANCE_LEGAL_TOPIC_RULES: Array<{
  topic: string;
  terms: string[];
}> = [
  { topic: "BHXH", terms: ["bhxh", "bảo hiểm xã hội"] },
  { topic: "BHYT", terms: ["bhyt", "bảo hiểm y tế"] },
  { topic: "BHTN", terms: ["bhtn", "bảo hiểm thất nghiệp", "trợ cấp thất nghiệp"] },
  { topic: "Thai sản", terms: ["thai sản", "chế độ thai sản", "luật dân số", "sàng lọc"] },
  {
    topic: "Lương cơ sở",
    terms: ["lương cơ sở", "mức tham chiếu", "tăng lương cơ sở"],
  },
  { topic: "Ốm đau", terms: ["ốm đau", "chế độ ốm đau"] },
  { topic: "Hưu trí", terms: ["hưu trí", "lương hưu", "hưu trí xã hội"] },
  { topic: "Tử tuất", terms: ["tử tuất"] },
  {
    topic: "Tai nạn lao động",
    terms: ["tai nạn lao động", "bệnh nghề nghiệp"],
  },
];

const EXCLUDED_LINH_VUC = [
  "Thuốc &VTYT",
  "Kết quả đấu thầu thuốc tập trung quốc gia",
  "Tuyển Nhân sự",
] as const;

const BIDDING_RESULT_PATTERNS: RegExp[] = [
  /^Kết quả đấu thầu\b/i,
  /\bKQĐT\b/i,
  /\bKQ-ĐT/i,
  /\/ĐT-/i,
  /\/KQĐT\b/i,
  /đấu thầu.*(thuốc|vtyt|vật tư y tế|mua sắm|tập trung)/i,
  /giá thuốc trúng thầu/i,
  /kết quả giá thuốc trúng thầu/i,
];

const EXCLUDED_TRICH_YEU_PATTERNS: RegExp[] = [
  /đấu thầu thuốc/i,
  /danh mục.*thuốc/i,
  /số đăng ký lưu hành thuốc/i,
  /vật tư y tế/i,
  /\bVTYT\b/i,
  /\/QLD\b/i,
  /\/QLD-/i,
  /tỷ giá hạch toán/i,
  /điểm thi thăng hạng/i,
  /dân tộc thiểu số/i,
  /khung kế hoạch dân tộc/i,
  /phòng, chống ma túy/i,
  /lựa chọn nhà thầu/i,
  /đấu thầu qua mạng/i,
  /bộ luật hình sự/i,
  /luật.*hình sự/i,
  /giới thiệu chức danh và chữ ký/i,
  /kết quả đấu thầu/i,
  /giá thuốc trúng thầu/i,
  /đào tạo tiếng anh/i,
  /nhiệm vụ khoa học/i,
  /tiết kiệm, chống lãng phí/i,
  /tuyển chọn cử đi/i,
  /chương trình công tác tuyên truyền/i,
  /chữ ký số, chứng thư số/i,
  /quy chế.*cổng thông tin điện tử/i,
  /quản trị mạng/i,
  /mạng nội bộ/i,
  /an toàn thông tin/i,
  /thư điện tử ngành bảo hiểm/i,
  /phân bổ dự toán/i,
  /công bố công khai.*dự toán/i,
  /mua thuốc tập trung/i,
  /quy định chức năng, nhiệm vụ/i,
  /chương trình công tác trọng tâm/i,
  /kết luận.*hội nghị/i,
  /thông báo kết luận/i,
  /đẩy mạnh hoạt động tuyên truyền/i,
  /kế hoạch tổ chức các hoạt động truyền thông/i,
  /kết quả thực hiện công tác phối hợp tuyên truyền/i,
  /tổ chức chương trình truyền hình trực tiếp/i,
  /báo cáo tình hình thực hiện nghị định/i,
  /danh sách điểm chi trả/i,
  /lịch tiếp công dân/i,
  /thi tuyển/i,
  /thăng hạng viên chức/i,
  /nâng ngạch công chức/i,
  /phong trào thi đua/i,
  /báo cáo công khai tình hình thực hiện dự toán/i,
  /công khai tài sản/i,
  /tiếp nhận.*viên chức/i,
  /luật tố cáo/i,
  /giải báo chí/i,
  /ngày pháp luật/i,
  /cải cách hành chính/i,
  /quản lý hoạt động công nghệ thông tin/i,
  /danh mục các văn bản cần đọc/i,
  /phối hợp tuyên truyền/i,
  /tuyên truyền, phổ biến luật/i,
  /hưởng ứng/i,
  /chương trình công tác thông tin/i,
  /kế hoạch thông tin, truyền thông/i,
  /kế hoạch rà soát, hệ thống hóa văn bản/i,
  /kế hoạch triển khai.*đại lý thu/i,
  /kế hoạch thanh tra/i,
  /quy trình biên tập, đăng tin/i,
  /ban cán sự đảng/i,
  /chương trình hành động của bảo hiểm/i,
  /tăng cường công tác tuyên truyền chính sách/i,
  /công tác truyền thông bảo hiểm/i,
];

const POSITIVE_POLICY_PATTERNS: RegExp[] = [
  /quy trình thu bhxh/i,
  /chế độ bhxh/i,
  /chế độ bhyt/i,
  /chế độ bhtn/i,
  /mức đóng bảo hiểm/i,
  /tỷ lệ đóng/i,
  /đóng bhxh/i,
  /trợ cấp bhxh/i,
  /trợ cấp hàng tháng/i,
  /điều chỉnh lương hưu/i,
  /sổ bhxh/i,
  /thẻ bhyt/i,
  /cấp sổ bảo hiểm/i,
  /cấp thẻ bảo hiểm/i,
  /giao dịch điện tử.*bảo hiểm/i,
  /thanh toán chi phí.*bhyt/i,
  /tk1-ts/i,
  /tờ khai tham gia bhxh/i,
  /quỹ bảo hiểm tai nạn/i,
];

export function extractBhxhLegalLinhVuc(body: string): string | null {
  const match = body.match(/Lĩnh vực:\s*([^\n]+?)(?:\s+Tải tệp|$)/iu);
  return match?.[1]?.trim() ?? null;
}

export function extractBhxhLegalLoaiVanBan(body: string): string | null {
  const match = body.match(/Loại văn bản:\s*([^\n]+?)(?:\s+Cơ quan|$)/iu);
  return match?.[1]?.trim() ?? null;
}

/** Kết quả đấu thầu (thuốc, VTYT, mua sắm…) — không phải văn bản chính sách BHXH. */
export function isBiddingResultDocument(input: {
  title?: string;
  summary?: string;
  body?: string;
  documentNumber?: string | null;
}): boolean {
  const linhVuc = input.body ? extractBhxhLegalLinhVuc(input.body) : null;
  const loaiVanBan = input.body ? extractBhxhLegalLoaiVanBan(input.body) : null;
  if (linhVuc?.includes("Kết quả đấu thầu")) return true;
  if (loaiVanBan?.includes("Kết quả đấu thầu")) return true;

  const trichYeu = input.body
    ? extractBhxhLegalTrichYeu(input.body, input.title)
    : "";
  const haystack = [
    trichYeu,
    input.title,
    input.summary,
    input.documentNumber,
  ]
    .filter(Boolean)
    .join("\n");

  return BIDDING_RESULT_PATTERNS.some((pattern) => pattern.test(haystack));
}

export function extractBhxhLegalTrichYeu(body: string, title?: string): string {
  const match = body.match(/Trích yếu:\s*(.+?)\s+Loại văn bản:/iu);
  if (match?.[1]) return match[1].trim();

  const parts = (title ?? "")
    .split(":")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts.slice(1).join(": ").trim();
  return title?.trim() ?? "";
}

export function detectInsuranceLegalTopics(text: string): string[] {
  const lower = text.toLocaleLowerCase("vi-VN");
  return INSURANCE_LEGAL_TOPIC_RULES.filter((rule) =>
    rule.terms.some((term) => lower.includes(term)),
  ).map((rule) => rule.topic);
}

function searchableInsuranceText(input: {
  title?: string;
  summary?: string;
  body?: string;
}): string {
  const trichYeu = input.body
    ? extractBhxhLegalTrichYeu(input.body, input.title)
    : "";
  return [trichYeu, input.title, input.summary]
    .filter(Boolean)
    .join("\n")
    .trim();
}

/** Văn bản có nội dung chính sách BHXH/BHYT/BHTN — loại thuốc, đấu thầu, CNTT nội bộ, v.v. */
export function isInsuranceLegalDocumentRelevant(input: {
  title?: string;
  summary?: string;
  body?: string;
  documentNumber?: string | null;
}): boolean {
  if (isBiddingResultDocument(input)) return false;

  const linhVuc = input.body ? extractBhxhLegalLinhVuc(input.body) : null;
  if (
    linhVuc &&
    EXCLUDED_LINH_VUC.some((category) => linhVuc.includes(category))
  ) {
    return false;
  }

  const haystack = searchableInsuranceText(input);
  if (!haystack) return false;

  if (EXCLUDED_TRICH_YEU_PATTERNS.some((pattern) => pattern.test(haystack))) {
    return false;
  }

  if (detectInsuranceLegalTopics(haystack).length > 0) return true;
  return POSITIVE_POLICY_PATTERNS.some((pattern) => pattern.test(haystack));
}
