"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MaintenanceBanner } from "@/components/layout/MaintenanceBanner";

const MINIMAL_CHROME_PREFIXES = [
  "/my-hr",
  "/time",
  "/pay",
  "/approvals",
  "/login",
  "/hr",
] as const;

export function usesMinimalChrome(pathname: string): boolean {
  return MINIMAL_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function AppChrome({
  children,
  maintenanceBannerVi,
}: {
  children: React.ReactNode;
  maintenanceBannerVi?: string | null;
}) {
  const pathname = usePathname();
  const minimal = usesMinimalChrome(pathname);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Bỏ qua điều hướng
      </a>
      <MaintenanceBanner message={maintenanceBannerVi ?? null} />
      {minimal ? null : <SiteHeader />}
      <main
        id="main"
        className={
          minimal
            ? "flex min-h-dvh flex-1 flex-col bg-background"
            : "flex flex-1 flex-col bg-background"
        }
      >
        {children}
      </main>
      {minimal ? null : <SiteFooter />}
    </>
  );
}
