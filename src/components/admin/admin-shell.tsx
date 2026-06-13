import Link from "next/link";
import type { AuthUser } from "@/lib/auth/session";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/topics", label: "Chủ đề" },
  { href: "/admin/tickets", label: "Ticket HR" },
  { href: "/admin/legal-crawler", label: "Crawl pháp luật" },
  { href: "/admin/calculators", label: "Công thức tính" },
  { href: "/admin/search-analytics", label: "Tra cứu" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              CMS · FPT Telecom
            </p>
            <p className="mt-1 text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
            <nav className="mt-4 space-y-1" aria-label="CMS">
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
