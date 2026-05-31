"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageRangeLabel } from "@/lib/pagination/paginate";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  className?: string;
  /** Dùng Link (SEO, mobile back) thay vì nút onClick. */
  buildHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
};

function PaginationNavButton({
  targetPage,
  disabled,
  label,
  children,
  buildHref,
  onPageChange,
}: {
  targetPage: number;
  disabled: boolean;
  label: string;
  children: ReactNode;
  buildHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
}) {
  const classes = cn(
    "min-h-12 h-12 min-w-[6.5rem] rounded-xl px-4 text-base sm:min-h-11 sm:h-11 sm:text-sm",
    disabled && "pointer-events-none opacity-40",
  );

  if (buildHref && !disabled) {
    return (
      <Button variant="ctaSecondary" size="touch" className={classes} asChild>
        <Link href={buildHref(targetPage)} scroll aria-label={label}>
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ctaSecondary"
      size="touch"
      className={classes}
      disabled={disabled}
      aria-label={label}
      onClick={() => onPageChange?.(targetPage)}
    >
      {children}
    </Button>
  );
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  className,
  buildHref,
  onPageChange,
}: PaginationControlsProps) {
  if (totalItems <= pageSize) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        className,
      )}
      aria-label="Phân trang"
    >
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Trang{" "}
        <span className="font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <span className="hidden sm:inline"> · </span>
        <span className="block sm:inline">
          {pageRangeLabel(page, pageSize, totalItems)} mục
        </span>
      </p>
      <div className="flex items-center justify-center gap-2">
        <PaginationNavButton
          targetPage={page - 1}
          disabled={!canPrev}
          label="Trang trước"
          buildHref={buildHref}
          onPageChange={onPageChange}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Trước
        </PaginationNavButton>
        <PaginationNavButton
          targetPage={page + 1}
          disabled={!canNext}
          label="Trang sau"
          buildHref={buildHref}
          onPageChange={onPageChange}
        >
          Sau
          <ChevronRight className="ml-1 h-4 w-4" />
        </PaginationNavButton>
      </div>
    </nav>
  );
}
