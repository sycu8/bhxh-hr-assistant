export type SiteNavLink = {
  href: string;
  label: string;
  shortLabel?: string;
  cta?: boolean;
};

/** Luôn hiển thị — đúng hành trình nhân viên. */
export const PRIMARY_NAV: SiteNavLink[] = [
  { href: "/login", label: "Cổng HR", shortLabel: "HR", cta: true },
  { href: "/bao-hiem", label: "Bảo hiểm", shortLabel: "BH" },
  { href: "/search", label: "Tra cứu", shortLabel: "Tra cứu" },
];

/** Màn rộng: thêm trực tiếp, không cần menu Khác. */
export const DESKTOP_EXTRA_NAV: SiteNavLink[] = [
  { href: "/legal-updates", label: "Pháp luật", shortLabel: "PL" },
  { href: "/calculators", label: "Công cụ", shortLabel: "Công cụ" },
];

/** Gom các mục ít dùng / quản trị. */
export const MORE_NAV: SiteNavLink[] = [
  { href: "/hoi-dap", label: "FAQ" },
  { href: "/ask-hr", label: "Hỏi HR/C&B" },
  { href: "/my-hr/profile", label: "Hồ sơ của tôi" },
  { href: "/legal-updates", label: "Cập nhật pháp luật" },
  { href: "/nguon-phap-luat", label: "Mục lục nguồn" },
  { href: "/calculators", label: "Công cụ cho Nhân viên" },
  { href: "/cong-cu-luong-thue", label: "Tính lương" },
  { href: "/calculators/luong-co-ban", label: "Lương cơ bản" },
  { href: "/calculators/chinh-sach-mien-giam", label: "Miễn giảm" },
];

export const FOOTER_NAV: SiteNavLink[] = [
  { href: "/login", label: "Cổng HR" },
  { href: "/bao-hiem", label: "Bảo hiểm" },
  { href: "/ask-hr", label: "Hỏi HR/C&B" },
  { href: "/developers", label: "API" },
  { href: "/nguon-phap-luat", label: "Mục lục nguồn" },
  { href: "/legal-updates", label: "Cập nhật pháp luật" },
  { href: "/topics", label: "Chủ đề quyền lợi" },
];
