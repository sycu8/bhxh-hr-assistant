import Link from "next/link";
import type { HrConsoleUser } from "@/lib/auth/require-hr";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/hr", label: "Tổng quan" },
  { href: "/hr/employees", label: "Nhân viên" },
  { href: "/hr/tickets", label: "Ticket HR" },
  { href: "/hr/content/policies", label: "Chính sách" },
  { href: "/hr/reports", label: "Báo cáo" },
  { href: "/admin", label: "CMS nội dung" },
  { href: "/admin/audit", label: "Audit log" },
];

export function HrConsoleShell({
  user,
  children,
}: {
  user: HrConsoleUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              HR Console · FPT Telecom
            </p>
            <p className="mt-1 text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
            <nav className="mt-4 space-y-1" aria-label="HR Console">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <AdminLogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
