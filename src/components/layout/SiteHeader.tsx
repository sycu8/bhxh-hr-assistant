"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FptTelecomLogo } from "@/components/brand/FptTelecomLogo";
import {
  DESKTOP_EXTRA_NAV,
  MORE_NAV,
  PRIMARY_NAV,
  type SiteNavLink,
} from "@/lib/navigation/site-nav";
import { cn } from "@/lib/utils";

function navLinkClass(item: SiteNavLink, active: boolean) {
  return cn(
    "touch-manipulation rounded-lg px-2.5 py-2 text-sm font-medium transition-all active:scale-[0.98] sm:px-3",
    item.cta
      ? "bg-fti-orange font-semibold text-fti-orange-foreground shadow-md hover:bg-fti-orange/92"
      : active
        ? "bg-muted font-semibold text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: SiteNavLink;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={navLinkClass(item, active)}
      aria-label={item.label}
      onClick={onNavigate}
    >
      {item.shortLabel && item.shortLabel !== item.label ? (
        <>
          <span className="md:hidden">{item.shortLabel}</span>
          <span className="hidden md:inline">{item.label}</span>
        </>
      ) : (
        item.label
      )}
    </Link>
  );
}

function MoreMenu({
  moreItems,
  moreActive,
  isActive,
}: {
  moreItems: SiteNavLink[];
  moreActive: boolean;
  isActive: (href: string) => boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [moreOpen]);

  return (
    <div className="relative" ref={moreRef}>
      <button
        type="button"
        className={cn(
          navLinkClass({ href: "#", label: "Khác" }, moreActive),
          "inline-flex items-center gap-1",
        )}
        aria-expanded={moreOpen}
        aria-haspopup="true"
        onClick={() => setMoreOpen((o) => !o)}
      >
        <span className="md:hidden">
          {moreOpen ? (
            <X className="h-4 w-4" aria-hidden />
          ) : (
            <Menu className="h-4 w-4" aria-hidden />
          )}
        </span>
        Khác
      </button>
      {moreOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-[min(100vw-1.5rem,16rem)] rounded-xl border border-border bg-card p-2 shadow-lg md:w-56"
          role="menu"
        >
          <div className="md:hidden">
            {MORE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setMoreOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setMoreOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const moreItems = useMemo(
    () =>
      MORE_NAV.filter(
        (item) =>
          !DESKTOP_EXTRA_NAV.some((extra) => extra.href === item.href),
      ),
    [],
  );

  const moreActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          aria-label="Trang chủ — Cổng bảo hiểm FPT Telecom"
        >
          <FptTelecomLogo priority />
          <span className="hidden min-w-0 leading-none lg:inline">
            Bảo hiểm
          </span>
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1"
        >
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}

          <div className="hidden items-center gap-0.5 md:flex">
            {DESKTOP_EXTRA_NAV.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </div>

          <MoreMenu
            key={pathname}
            moreItems={moreItems}
            moreActive={moreActive}
            isActive={isActive}
          />
        </nav>
      </div>
    </header>
  );
}
