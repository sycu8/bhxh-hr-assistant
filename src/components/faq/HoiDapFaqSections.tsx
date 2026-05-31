"use client";

import { Badge } from "@/components/ui/badge";
import { FaqQuestionCard } from "@/components/faq/FaqQuestionCard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { FAQ_PAGE_SIZE } from "@/lib/pagination/constants";
import type { CuratedFaq } from "@/lib/data/curated-faqs";

export type HoiDapFaqEntry = CuratedFaq & {
  topicTitle: string;
};

type Props = {
  entries: HoiDapFaqEntry[];
};

function HoiDapFaqSectionsView({ entries }: Props) {
  const { items, page, totalPages, totalItems, setPage } = useClientPagination(
    entries,
    FAQ_PAGE_SIZE,
  );

  return (
    <div className="space-y-4">
      {page > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={FAQ_PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((faq) => (
          <FaqQuestionCard
            key={faq.slug}
            href={`/hoi-dap/${faq.slug}`}
            question={faq.question}
            preview={faq.answer}
            secondaryHref={`/search?q=${encodeURIComponent(faq.question)}`}
            headerExtras={
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">FAQ sẵn</Badge>
                <Badge variant="outline">{faq.topicTitle}</Badge>
              </div>
            }
          />
        ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={FAQ_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

export function HoiDapFaqSections({ entries }: Props) {
  return <HoiDapFaqSectionsView key={`${entries.length}|${FAQ_PAGE_SIZE}`} entries={entries} />;
}
