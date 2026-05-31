import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Nút phụ (viền) thay vì nền đặc. */
  secondary?: boolean;
  external?: boolean;
};

/** Liên kết dạng nút — dễ nhìn, dễ chạm (mobile-first). */
export function CtaLink({
  href,
  children,
  className,
  secondary = false,
  external = false,
}: CtaLinkProps) {
  const base = cn(
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-center text-base font-semibold touch-manipulation transition-all active:scale-[0.98] sm:min-h-11 sm:w-auto sm:text-sm",
    secondary
      ? "border-2 border-primary/25 bg-card text-primary shadow-sm hover:border-primary/45 hover:bg-sky-50"
      : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl",
    className,
  );

  if (external) {
    return (
      <a href={href} className={base} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={base} scroll>
      {children}
    </Link>
  );
}

/** Liên kết “Xem thêm” — rõ ràng hơn underline thuần. */
export function CtaTextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15",
        className,
      )}
    >
      {children}
    </Link>
  );
}
