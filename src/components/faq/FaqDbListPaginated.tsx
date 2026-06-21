"use client";

import { Badge } from "@/components/ui/badge";
import { FaqQuestionCard } from "@/components/faq/FaqQuestionCard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { FAQ_PAGE_SIZE } from "@/lib/pagination/constants";

export type FaqDbListItem = {
  id: string;
  question: string;
  shortAnswer: string;
  category_slug: string | null;
  category_name: string | null;
  citations_count: number;
};

type Props = {
  items: FaqDbListItem[];
  pageSize?: number;
};

export function FaqDbListPaginated({ items, pageSize = FAQ_PAGE_SIZE }: Props) {
  const { items: pageItems, page, totalPages, totalItems, setPage } =
    useClientPagination(items, pageSize);

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Chưa có mục nào.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {page > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {pageItems.map((f) => (
          <FaqQuestionCard
            key={f.id}
            href={`/faq/${f.id}`}
            question={f.question}
            preview={f.shortAnswer}
            secondaryHref={`/search?q=${encodeURIComponent(f.question)}`}
            secondaryLabel="Mở trong câu trả lời"
            headerExtras={
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Đã duyệt</Badge>
                  {f.category_slug ? (
                    <Badge variant="outline">{f.category_name ?? f.category_slug}</Badge>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {f.citations_count} nguồn trích dẫn
                </span>
              </div>
            }
          />
        ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
