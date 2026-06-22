import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  Briefcase,
  Calculator,
  FileSearch,
  HelpCircle,
  Mail,
  MessageCircleQuestion,
  ReceiptText,
  Scale,
  TrendingUp,
  UserX,
  UsersRound,
} from "lucide-react";

export const EMPLOYEE_TOOLS_SECTION_TITLE = "Công cụ cho Nhân viên";

export type EmployeeToolLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  cta: string;
};

export type EmployeeToolGroup = {
  id: string;
  title: string;
  description: string;
  tools: EmployeeToolLink[];
};

/** Tính lương, lương cơ bản, miễn giảm. */
export const PAYROLL_EMPLOYEE_TOOLS: EmployeeToolLink[] = [
  {
    title: "Tính lương",
    description:
      "Ước tính lương gộp → thực nhận, thực nhận → gộp và bảng chi tiết BHXH, BHYT, BHTN, thuế TNCN.",
    href: "/cong-cu-luong-thue",
    icon: Calculator,
    cta: "Tính ngay",
  },
  {
    title: "Cập nhật lương cơ bản",
    description:
      "Lương cơ sở, lương tối thiểu vùng và trần đóng bảo hiểm theo cấu hình mới nhất trong hệ thống.",
    href: "/calculators/luong-co-ban",
    icon: TrendingUp,
    cta: "Xem mức hiện hành",
  },
  {
    title: "Chính sách miễn giảm mới nhất",
    description:
      "Giảm trừ bản thân, người phụ thuộc và tra cứu văn bản miễn giảm / giảm trừ gia cảnh.",
    href: "/calculators/chinh-sach-mien-giam",
    icon: Scale,
    cta: "Xem chính sách",
  },
];

/** Tra cứu, FAQ, pháp luật — nhân viên dùng trước khi hỏi HR. */
export const LOOKUP_EMPLOYEE_TOOLS: EmployeeToolLink[] = [
  {
    title: "Tra cứu nhanh",
    description: "Gõ câu hỏi bằng tiếng Việt — hệ thống gợi ý FAQ và căn cứ có nguồn.",
    href: "/search",
    icon: FileSearch,
    cta: "Tra cứu",
  },
  {
    title: "FAQ thường gặp",
    description: "Câu hỏi đã được HR duyệt, có trang trả lời chi tiết và liên kết văn bản.",
    href: "/hoi-dap",
    icon: HelpCircle,
    cta: "Xem FAQ",
  },
  {
    title: "Chủ đề BHXH & phúc lợi",
    description: "Đi theo từng chủ đề: BHXH, BHYT, BHTN, thai sản, ốm đau, hưu trí…",
    href: "/topics",
    icon: MessageCircleQuestion,
    cta: "Chọn chủ đề",
  },
  {
    title: "Cập nhật pháp luật",
    description: "Văn bản mới đã duyệt — lọc theo ngày ban hành, tìm kiếm, phân trang.",
    href: "/legal-updates",
    icon: Scale,
    cta: "Xem cập nhật",
  },
  {
    title: "Mục lục nguồn pháp luật",
    description: "Mở tài liệu gốc và đối chiếu điều khoản trước khi chốt với HR.",
    href: "/nguon-phap-luat",
    icon: BookOpen,
    cta: "Mở nguồn",
  },
];

/** Chế độ nhân viên hay tra khi làm hồ sơ / đối chiếu quyền lợi. */
export const BENEFITS_EMPLOYEE_TOOLS: EmployeeToolLink[] = [
  {
    title: "Người phụ thuộc",
    description: "Đăng ký giảm trừ gia cảnh, giấy tờ cần có và lưu ý khi kê khai thuế.",
    href: "/topics/nguoi-phu-thuoc",
    icon: UsersRound,
    cta: "Xem hướng dẫn",
  },
  {
    title: "Thai sản",
    description: "Nghỉ sinh, mức hưởng chế độ và hồ sơ thường cần với HR/C&B.",
    href: "/topics/thai-san",
    icon: Baby,
    cta: "Xem chủ đề",
  },
  {
    title: "Trợ cấp thất nghiệp (BHTN)",
    description: "Điều kiện, thời hạn hưởng và thủ tục khi chấm dứt hợp đồng.",
    href: "/topics/bhtn",
    icon: Briefcase,
    cta: "Xem chủ đề",
  },
  {
    title: "Nghỉ việc & chốt bảo hiểm",
    description: "Quyền lợi khi nghỉ, thời điểm chốt đóng và việc cần làm với HR.",
    href: "/topics/nghi-viec",
    icon: UserX,
    cta: "Xem chủ đề",
  },
];

/** Liên hệ HR khi tra cứu chưa đủ. */
export const HR_CONTACT_EMPLOYEE_TOOLS: EmployeeToolLink[] = [
  {
    title: "Hỏi HR / C&B",
    description: "Gửi câu hỏi có căn cứ — form bắt buộc thông tin để HR trả lời nhanh hơn.",
    href: "/ask-hr",
    icon: Mail,
    cta: "Gửi câu hỏi",
  },
];

export const EMPLOYEE_TOOL_GROUPS: EmployeeToolGroup[] = [
  {
    id: "payroll",
    title: "Lương, thuế & miễn giảm",
    description: "Tính toán và đối chiếu mức lương, đóng bảo hiểm, giảm trừ thuế.",
    tools: PAYROLL_EMPLOYEE_TOOLS,
  },
  {
    id: "lookup",
    title: "Tra cứu & căn cứ",
    description: "Tự tìm câu trả lời và văn bản trước khi nhờ HR.",
    tools: LOOKUP_EMPLOYEE_TOOLS,
  },
  {
    id: "benefits",
    title: "Quyền lợi & chế độ",
    description: "Các tình huống nhân viên hay hỏi HR nhất.",
    tools: BENEFITS_EMPLOYEE_TOOLS,
  },
  {
    id: "hr-contact",
    title: "Liên hệ HR",
    description: "Khi cần xác nhận riêng theo hồ sơ cá nhân.",
    tools: HR_CONTACT_EMPLOYEE_TOOLS,
  },
];

/** Giữ tương thích import cũ — ba công cụ lương chính. */
export const PRIMARY_EMPLOYEE_TOOLS = PAYROLL_EMPLOYEE_TOOLS;

/** Lối tắt tính lương trên trang chủ. */
export const HOME_SALARY_TOOL_SHORTCUTS = [
  {
    title: "Lương gộp → thực nhận",
    description: "Ước tính thực nhận sau bảo hiểm và thuế TNCN.",
    example: "Nhập lương gộp và số người phụ thuộc",
    href: "/cong-cu-luong-thue?mode=gross-to-net",
    icon: Calculator,
  },
  {
    title: "Thực nhận → lương gộp",
    description: "Tìm mức lương gộp tương ứng mức thực nhận mong muốn.",
    example: "Hữu ích khi đàm phán offer hoặc đối chiếu phiếu lương",
    href: "/cong-cu-luong-thue?mode=net-to-gross",
    icon: ReceiptText,
  },
  {
    title: "Bảng chi tiết khấu trừ",
    description: "Xem từng khoản bảo hiểm, giảm trừ và bậc thuế.",
    example: "Kèm căn cứ hiệu lực theo năm cấu hình",
    href: "/cong-cu-luong-thue?mode=take-home",
    icon: ReceiptText,
  },
] as const;

/** Tra cứu nhanh trên trang chủ (ngoài 3 thẻ lương). */
export const HOME_QUICK_LOOKUP_TOOLS: EmployeeToolLink[] = [
  LOOKUP_EMPLOYEE_TOOLS[0],
  LOOKUP_EMPLOYEE_TOOLS[1],
  HR_CONTACT_EMPLOYEE_TOOLS[0],
];
