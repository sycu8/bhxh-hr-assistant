/** Kỳ vọng smoke cho từng URL công khai (E2E + tài liệu). */
export type PublicRouteSpec = {
  path: string;
  /** Chuỗi phải có trong HTML sau khi render (redirect đã theo). */
  mustContain: string;
  /** URL cuối sau redirect (regex). */
  finalUrl?: RegExp;
  /** Bỏ qua khi không có DATABASE_URL (trang admin động). */
  requiresDb?: boolean;
};

export const PUBLIC_ROUTE_SPECS: PublicRouteSpec[] = [
  { path: "/", mustContain: "Công cụ cho Nhân viên" },
  { path: "/search", mustContain: "Tra cứu" },
  { path: "/hoi-dap", mustContain: "Hỏi" },
  { path: "/ask-hr", mustContain: "Soạn câu hỏi" },
  { path: "/calculators", mustContain: "Công cụ cho Nhân viên" },
  { path: "/calculators/luong-co-ban", mustContain: "Lương cơ sở" },
  { path: "/calculators/chinh-sach-mien-giam", mustContain: "Giảm trừ bản thân" },
  { path: "/calculators/che-do-thai-san", mustContain: "Chế độ thai sản" },
  {
    path: "/cong-cu-luong-thue",
    mustContain: "Tính lương",
  },
  {
    path: "/cong-cu-luong-thue?mode=gross-to-net",
    mustContain: "Tính lương",
  },
  { path: "/nguon-phap-luat", mustContain: "nguồn" },
  { path: "/topics", mustContain: "Chủ đề" },
  { path: "/legal-updates", mustContain: "pháp luật" },
  {
    path: "/cap-nhat-phap-luat",
    mustContain: "pháp luật",
    finalUrl: /\/legal-updates/,
  },
  {
    path: "/topics/bhtn",
    mustContain: "BHTN",
    finalUrl: /\/topics\/bhtn/,
  },
  {
    path: "/topics/nguoi-phu-thuoc",
    mustContain: "Người phụ thuộc",
    finalUrl: /\/topics\/nguoi-phu-thuoc/,
  },
];
