import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FaqQuestionCardProps = {
  href: string;
  question: string;
  preview: string;
  headerExtras?: ReactNode;
  /** Liên kết tra cứu phụ (không che vùng nhấn câu hỏi). */
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function FaqQuestionCard({
  href,
  question,
  preview,
  headerExtras,
  secondaryHref,
  secondaryLabel = "Tra cứu tương tự",
}: FaqQuestionCardProps) {
  return (
    <Card className="relative border-sky-100 transition-colors hover:border-sky-200 hover:bg-sky-50/40">
      <CardHeader className="pb-2">
        {headerExtras}
        <CardTitle className="text-base leading-snug">
          <Link
            href={href}
            className="text-foreground underline-offset-4 hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:inset-0 after:z-0 after:rounded-xl after:content-['']"
          >
            {question}
          </Link>
        </CardTitle>
        <CardDescription className="pointer-events-none line-clamp-3 text-sm leading-relaxed">
          {preview}
        </CardDescription>
      </CardHeader>
      {secondaryHref ? (
        <CardContent className="relative z-10 pt-0">
          <Link
            href={secondaryHref}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {secondaryLabel}
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
