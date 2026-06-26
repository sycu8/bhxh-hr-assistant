import Link from "next/link";
import {
  CalendarDays,
  FileText,
  LogIn,
  Shield,
  Ticket,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HR_QUICK_LINKS = [
  {
    href: "/login",
    title: "Đăng nhập nhân viên",
    description: "OTP qua email công ty — xem hồ sơ, nghỉ phép, phiếu lương.",
    icon: LogIn,
    cta: true,
  },
  {
    href: "/time/leave",
    title: "Nghỉ phép",
    description: "Số dư, đăng ký nghỉ và theo dõi phê duyệt.",
    icon: CalendarDays,
  },
  {
    href: "/pay/payslips",
    title: "Phiếu lương",
    description: "Xem kỳ lương và chi tiết khấu trừ.",
    icon: Wallet,
  },
  {
    href: "/my-hr/documents",
    title: "Giấy tờ HR",
    description: "Xác nhận công tác, thu nhập, bảo hiểm.",
    icon: FileText,
  },
  {
    href: "/bao-hiem",
    title: "Tra cứu bảo hiểm",
    description: "BHXH, BHYT, BHTN — FAQ và cập nhật pháp luật.",
    icon: Shield,
  },
  {
    href: "/ask-hr",
    title: "Ticket HR/C&B",
    description: "Gửi yêu cầu khi cần xử lý thủ công.",
    icon: Ticket,
  },
] as const;

export function HomeHrPortalSection() {
  return (
    <section
      aria-labelledby="hr-portal-heading"
      className="rounded-3xl border border-border bg-gradient-to-br from-[hsl(var(--sidebar))] via-[hsl(214_72%_18%)] to-[hsl(214_72%_24%)] p-6 text-[hsl(var(--sidebar-foreground))] shadow-xl sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            FPT Telecom · Nhân sự
          </p>
          <h2
            id="hr-portal-heading"
            className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Cổng HR self-service
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
            Một điểm vào cho nhân viên: hồ sơ, nghỉ phép, lương, giấy tờ và tra
            cứu bảo hiểm. Đăng nhập bằng email công ty (OTP).
          </p>
          <Button
            asChild
            size="touch"
            className="mt-5 bg-fti-orange font-semibold text-fti-orange-foreground hover:bg-fti-orange/90"
          >
            <Link href="/login">Vào Cổng HR</Link>
          </Button>
        </div>
        <p className="text-xs text-white/60 lg:max-w-xs lg:text-right">
          Quản lý/HR: sau khi đăng nhập dùng menu{" "}
          <span className="font-medium text-white/80">HR Console</span> hoặc{" "}
          <Link href="/admin/login" className="underline underline-offset-2">
            CMS
          </Link>
          .
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HR_QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              "cta" in item && item.cta
                ? "group rounded-2xl border border-fti-orange/40 bg-fti-orange/10 p-4 transition hover:border-fti-orange/70 hover:bg-fti-orange/15"
                : "group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/25 hover:bg-white/10"
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  "cta" in item && item.cta
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fti-orange text-fti-orange-foreground"
                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"
                }
              >
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-snug text-white/75">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
