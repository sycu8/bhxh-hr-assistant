"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { EmployeeAuthUser } from "@/lib/auth/employee-session";
import { EmployeeLogoutButton } from "@/components/hr/employee-logout-button";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CalendarDays,
  CircleUser,
  ClipboardCheck,
  Shield,
  Wallet,
} from "lucide-react";

const PRIMARY_NAV = [
  { href: "/my-hr/profile", label: "Của tôi", icon: CircleUser },
  { href: "/time/leave", label: "Nghỉ phép", icon: CalendarDays },
  { href: "/pay/payslips", label: "Lương", icon: Wallet },
  { href: "/bao-hiem", label: "Bảo hiểm", icon: Shield },
] as const;

const DESKTOP_EXTRA = [
  { href: "/my-hr/tickets", label: "Ticket HR" },
  { href: "/my-hr/policies", label: "Chính sách" },
  { href: "/my-hr/documents", label: "Giấy tờ" },
  { href: "/pay/calculators", label: "Công cụ lương" },
] as const;

export function EmployeeShell({
  user,
  children,
  pendingApprovals = 0,
}: {
  user: EmployeeAuthUser;
  children: React.ReactNode;
  pendingApprovals?: number;
}) {
  const pathname = usePathname();
  const showApprovals =
    user.role === "MANAGER" ||
    user.role === "HR" ||
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-muted/30 pb-24 lg:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Self-service
            </p>
            <p className="mt-1 text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {user.role}
            </span>
            <nav className="mt-4 space-y-1" aria-label="Nhân viên">
              {PRIMARY_NAV.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {DESKTOP_EXTRA.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    pathname.startsWith(item.href) && "bg-primary/10 text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {showApprovals ? (
                <Link
                  href="/approvals"
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    pathname.startsWith("/approvals") &&
                      "bg-primary/10 text-primary",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Phê duyệt
                  </span>
                  {pendingApprovals > 0 ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {pendingApprovals}
                    </span>
                  ) : null}
                </Link>
              ) : null}
              {(user.role === "HR" ||
                user.role === "CB" ||
                user.role === "ADMIN" ||
                user.role === "SUPER_ADMIN" ||
                user.role === "MANAGER") && (
                <Link
                  href="/hr"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Briefcase className="h-4 w-4" />
                  HR Console
                </Link>
              )}
            </nav>
            <div className="mt-4">
              <EmployeeLogoutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        aria-label="Điều hướng chính"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
          {PRIMARY_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
