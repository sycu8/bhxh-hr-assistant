"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FptTelecomLogo } from "@/components/brand/FptTelecomLogo";

export function EmployeePortalHeader() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={isLogin ? "/" : "/my-hr/profile"}
          className="flex min-h-11 items-center gap-2 rounded-lg touch-manipulation"
          aria-label="Cổng HR FPT Telecom"
        >
          <FptTelecomLogo priority />
          <span className="hidden text-sm font-semibold leading-tight sm:inline">
            Cổng HR
            <span className="block text-xs font-normal text-muted-foreground">
              FPT Telecom
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {!isLogin ? (
            <Link
              href="/bao-hiem"
              className="hidden rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-muted sm:inline"
            >
              Bảo hiểm
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-muted"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </header>
  );
}
