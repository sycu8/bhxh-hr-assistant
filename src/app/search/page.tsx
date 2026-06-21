import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchClient } from "./search-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRIORITY_QUERIES,
  priorityQueryPath,
} from "@/lib/seo/priority-queries";

export const metadata: Metadata = {
  title: "Tra cứu",
  description:
    "Tìm kiếm câu hỏi về BHXH, BHYT, BHTN và chế độ lao động theo tài liệu đã duyệt.",
};

function SearchFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:max-w-5xl">
      <Skeleton className="mb-4 h-8 w-2/3 max-w-md" />
      <Skeleton className="mb-8 h-4 w-full max-w-lg" />
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <header className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:max-w-5xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Tra cứu bảo hiểm BHXH, BHYT, BHTN
        </h1>
        <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
          Chọn câu hỏi phổ biến hoặc nhập tình huống — hệ thống trả lời ngắn
          gọn kèm nguồn căn cứ.
        </p>
      </header>
      <section
        aria-label="Câu hỏi phổ biến"
        className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:max-w-5xl"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Câu hỏi phổ biến — trả lời sẵn
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {PRIORITY_QUERIES.map((q) => (
            <li key={q.id}>
              <Link
                href={priorityQueryPath(q.expectedSlug)}
                className="block rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium leading-snug shadow-sm transition hover:border-primary/30 hover:bg-muted/40"
              >
                {q.query}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Suspense fallback={<SearchFallback />}>
        <SearchClient />
      </Suspense>
    </>
  );
}
