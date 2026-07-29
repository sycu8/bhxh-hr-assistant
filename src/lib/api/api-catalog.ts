import { getSiteUrl } from "@/lib/site-url";

export type ApiAuthKind =
  | "none"
  | "turnstile"
  | "session-employee"
  | "session-cms"
  | "bearer-cron"
  | "bearer-media";

export type ApiEndpointSpec = {
  id: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  title: string;
  summary: string;
  audience: "public" | "employee" | "hr" | "automation";
  auth: ApiAuthKind;
  rateLimit?: string;
  requestContentType?: string;
  requestExample?: unknown;
  responseExample?: unknown;
  notes?: string[];
};

export const API_RESPONSE_ENVELOPE = {
  success: {
    success: true,
    data: "{ ... }",
  },
  error: {
    success: false,
    error: {
      code: "VALIDATION_ERROR | UNAUTHORIZED | ...",
      message: "Mô tả lỗi tiếng Việt",
      details: "optional",
    },
  },
} as const;

export const API_AUTH_GUIDE: Record<
  ApiAuthKind,
  { label: string; description: string }
> = {
  none: {
    label: "Không xác thực",
    description: "Chỉ dùng cho tài liệu hoặc health check công khai.",
  },
  turnstile: {
    label: "Cloudflare Turnstile",
    description:
      "Gửi `turnstileToken` trong JSON body sau khi widget xác minh trên trình duyệt. Server kiểm tra qua siteverify.",
  },
  "session-employee": {
    label: "Cookie employee_session",
    description:
      "Đăng nhập OTP qua `/api/v1/auth/otp/*`. Cookie HttpOnly được set sau verify.",
  },
  "session-cms": {
    label: "Cookie cms_session",
    description:
      "Đăng nhập CMS qua `POST /api/auth/login`. Dùng cho thao tác admin có session.",
  },
  "bearer-cron": {
    label: "Bearer CACHE_REVALIDATE_SECRET",
    description:
      "Header `Authorization: Bearer <secret>` cho cron và automation nội bộ (HRIS sync, crawl, cache).",
  },
  "bearer-media": {
    label: "Bearer MEDIA_INGEST_TOKEN",
    description:
      "Header `Authorization: Bearer <token>` cho ingest media tự động (tùy chọn).",
  },
};

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: "search",
    method: "POST",
    path: "/api/search",
    title: "Tra cứu BHXH/BHYT/BHTN",
    summary:
      "Hỏi bằng ngôn ngữ tự nhiên; trả về answer card, citations và danh sách hit.",
    audience: "public",
    auth: "turnstile",
    rateLimit: "30/phút/IP (PUBLIC_API_RATE_LIMIT_*)",
    requestContentType: "application/json",
    requestExample: {
      query: "Nghỉ không lương 14 ngày có đóng BHXH không?",
      employeeGroup: "OFFICIAL",
      categorySlug: "bhxh",
      hitLimit: 12,
      turnstileToken: "<token>",
    },
    responseExample: {
      success: true,
      data: {
        query: "…",
        hits: [],
        answer: {
          shortAnswer: "…",
          citations: [],
          confidenceLevel: "HIGH",
          needsHrReview: false,
        },
      },
    },
  },
  {
    id: "ask",
    method: "POST",
    path: "/api/ask",
    title: "Ghi log câu hỏi",
    summary: "Ghi nhận câu hỏi analytics (không trả answer card đầy đủ).",
    audience: "public",
    auth: "turnstile",
    rateLimit: "30/phút/IP",
    requestContentType: "application/json",
    requestExample: {
      question: "Mức đóng BHXH tối thiểu là bao nhiêu?",
      turnstileToken: "<token>",
    },
  },
  {
    id: "ask-hr-send",
    method: "POST",
    path: "/api/ask-hr/send",
    title: "Tạo ticket HR",
    summary:
      "Tạo ticket HR/C&B và gửi email thông báo. Gắn userId nếu có session nhân viên.",
    audience: "public",
    auth: "turnstile",
    rateLimit: "5/15 phút/IP (ASK_HR_RATE_LIMIT_*)",
    requestContentType: "application/json",
    requestExample: {
      question: "Em muốn xác nhận mức đóng BHXH tháng 5",
      topic: "bhxh",
      urgent: "normal",
      replyEmail: "employee@fpt.com",
      turnstileToken: "<token>",
    },
    responseExample: {
      success: true,
      data: {
        ticketId: "…",
        ticketNumber: "HR-2026-00042",
        status: "OPEN",
        notifyEmailSent: true,
        hrContact: "hr-cnb@example.com",
      },
    },
  },
  {
    id: "salary-tax",
    method: "POST",
    path: "/api/calculators/salary-tax",
    title: "Tính lương & thuế TNCN",
    summary:
      "Tính gross↔net, bảng khấu trừ BHXH/BHYT/BHTN và thuế theo cấu hình hiện hành.",
    audience: "public",
    auth: "none",
    requestContentType: "application/json",
    requestExample: {
      mode: "gross-to-net",
      grossSalary: 35_000_000,
      insuranceSalaryBase: 35_000_000,
      region: "I",
      dependentCount: 0,
    },
    notes: ["Không yêu cầu Turnstile — phù hợp tích hợp calculator nội bộ."],
  },
  {
    id: "social-insurance",
    method: "POST",
    path: "/api/calculators/social-insurance-contribution",
    title: "Tính mức đóng BHXH",
    summary: "Ước tính phần NLĐ/NSDLĐ đóng theo mức lương đóng BH.",
    audience: "public",
    auth: "none",
    requestContentType: "application/json",
    requestExample: { salaryBase: 20_000_000 },
  },
  {
    id: "otp-request",
    method: "POST",
    path: "/api/v1/auth/otp/request",
    title: "Gửi OTP đăng nhập nhân viên",
    summary: "Gửi mã OTP tới email công ty nếu tài khoản hợp lệ.",
    audience: "employee",
    auth: "turnstile",
    rateLimit: "10/15 phút/IP (LOGIN_RATE_LIMIT_*)",
    requestContentType: "application/json",
    requestExample: {
      email: "employee@fpt.com",
      turnstileToken: "<token>",
    },
    responseExample: {
      success: true,
      data: {
        message:
          "Nếu email thuộc tài khoản nhân viên hợp lệ, mã OTP đã được gửi.",
      },
    },
  },
  {
    id: "otp-verify",
    method: "POST",
    path: "/api/v1/auth/otp/verify",
    title: "Xác minh OTP",
    summary: "Xác minh mã OTP và thiết lập cookie `employee_session`.",
    audience: "employee",
    auth: "turnstile",
    requestContentType: "application/json",
    requestExample: {
      email: "employee@fpt.com",
      code: "123456",
      turnstileToken: "<token>",
    },
  },
  {
    id: "otp-logout",
    method: "DELETE",
    path: "/api/v1/auth/otp/verify",
    title: "Đăng xuất nhân viên",
    summary: "Hủy session nhân viên và xóa cookie.",
    audience: "employee",
    auth: "session-employee",
  },
  {
    id: "cms-login",
    method: "POST",
    path: "/api/auth/login",
    title: "Đăng nhập CMS",
    summary: "Email + mật khẩu cho HR/Admin; set cookie `cms_session`.",
    audience: "hr",
    auth: "turnstile",
    rateLimit: "10/15 phút/IP",
    requestContentType: "application/json",
    requestExample: {
      email: "admin@fpt.com",
      password: "••••••••",
      turnstileToken: "<token>",
    },
  },
  {
    id: "cms-logout",
    method: "DELETE",
    path: "/api/auth/login",
    title: "Đăng xuất CMS",
    summary: "Hủy session CMS và xóa cookie.",
    audience: "hr",
    auth: "session-cms",
  },
  {
    id: "hris-sync",
    method: "POST",
    path: "/api/cron/hris-sync",
    title: "Đồng bộ HRIS",
    summary: "Pull nhân viên từ adapter (mock hoặc Microsoft CSV).",
    audience: "automation",
    auth: "bearer-cron",
    notes: ["Tương đương `pnpm hr:sync`."],
  },
  {
    id: "daily-crawl",
    method: "POST",
    path: "/api/cron/daily-official-crawl",
    title: "Crawl pháp luật",
    summary: "Cron crawl nguồn chính thống (06:00 ICT).",
    audience: "automation",
    auth: "bearer-cron",
  },
  {
    id: "db-schema-sync",
    method: "POST",
    path: "/api/cron/db-schema-sync",
    title: "Đồng bộ schema HR",
    summary: "Chạy một lần sau deploy Cổng HR (migration idempotent).",
    audience: "automation",
    auth: "bearer-cron",
  },
  {
    id: "revalidate-cache",
    method: "POST",
    path: "/api/admin/revalidate-cache",
    title: "Xóa KV cache",
    summary: "Làm mới cache FAQ, legal updates, admin queue.",
    audience: "automation",
    auth: "bearer-cron",
  },
  {
    id: "media-ingest",
    method: "POST",
    path: "/api/media/ingest",
    title: "Ingest media (R2)",
    summary: "Tải/generate ảnh vào R2 — automation hoặc session CMS.",
    audience: "automation",
    auth: "bearer-media",
    notes: ["UI admin dùng session CMS thay vì bearer."],
  },
  {
    id: "openapi",
    method: "GET",
    path: "/api/openapi.json",
    title: "OpenAPI 3.1",
    summary: "Machine-readable spec cho Postman, Insomnia, codegen.",
    audience: "public",
    auth: "none",
  },
];

export function getApiBaseUrl(): string {
  return getSiteUrl();
}

export function absoluteApiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function groupEndpointsByAudience() {
  const groups: Record<ApiEndpointSpec["audience"], ApiEndpointSpec[]> = {
    public: [],
    employee: [],
    hr: [],
    automation: [],
  };
  for (const ep of API_ENDPOINTS) {
    groups[ep.audience].push(ep);
  }
  return groups;
}
